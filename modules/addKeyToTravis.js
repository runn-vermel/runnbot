
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    path = require('path');
    const sh = require('shelljs');

/**
 * our IIFE function
 */
var addKeyToTravis = (function() {

  /**
   * this function checks for the existance of a travis file, and throws a catchable error if it doesn't.
   * @param  {[String]}  dir [The repo path]
   * @return {Boolean}     [description]
   */
  var checkForTravisFile = function(dir) {
    return shared.doesFileExist(dir, '.travis.yml');
  };

  /**
   * spawns a new shells process and adds a travis encrypted key to the .travis.yml file
   * @param {[type]} dir [description]
   */
  var addKeyToTravis = function(dir) {
    var lastIndexOf = dir.lastIndexOf("/"),
        dirName = dir.substr(lastIndexOf + 1);

    return shared.execAsync('travis encrypt cloudflare="' + shared.travisKey + '" -r PredixDev/' + dirName + ' --add', dir);
  };

  /**
   * our Main function. calls the checkForTravisFile to check that we have a travis file in the repo.
   * if it does, add the key, if not, move on.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {

    return checkForTravisFile(dir)
    .then((fileExists) => {
      if (fileExists) {
        return addKeyToTravis(dir);
      } else {
        console.log("no travis file");
        return Promise.resolve();
      }
    })
    .then(() => {
      // Success, we're done. Hit the callback.
      cb(null,dir);
    });
  };

  return {
    main : main
  };
})();

module.exports = {
  main: addKeyToTravis.main
};
