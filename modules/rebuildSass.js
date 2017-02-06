
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra'));

/**
 * our IIFE function
 */
var rebuildSass = (function() {

  var doesGulpfileFileExist = function(dir) {
    var lastIndexOf = dir.lastIndexOf('/'),
        dirName = dir.substr(lastIndexOf+1);

    console.log("check if gulpfile file exists inside " + dirName);
    return shared.doesFileExist(dir, 'gulpfile.js');
  };
  var yarnInstall = function(dir) {
    var lastIndexOf = dir.lastIndexOf('/'),
        dirName = dir.substr(lastIndexOf+1);
    console.log("Yarn install inside " + dirName);
    shared.execAsync('yarn', dir);
  };

  var bowerInstall = function(dir) {
    var lastIndexOf = dir.lastIndexOf('/'),
        dirName = dir.substr(lastIndexOf+1);
        console.log("bower install inside " + dirName);
    shared.execAsync('bower install', dir);
  };

  var rebuildSass = function(dir) {
    var lastIndexOf = dir.lastIndexOf('/'),
        dirName = dir.substr(lastIndexOf+1);
        console.log("gulp sass inside " + dirName);
    shared.execAsync('gulp sass', dir);
  };

  /**
   * our Main function. calls the checkForTravisFile to check that we have a travis file in the repo.
   * if it does, add the key, if not, move on.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {

    return doesGulpfileFileExist(dir)
    .then((fileExists) => {
      if (fileExists) {
        return shared.doesDirExist(dir, 'sass');
      } else {
        throw new Error('noGulpfile');
      }
    })
    .then((dirExists) => {
      if (dirExists) {
        return yarnInstall(dir);
      } else {
        throw new Error('noSass');
      }
    })
    .then(() => bowerInstall(dir))
    .then(() => rebuildSass(dir))
    .then(() => {
      var lastIndexOf = dir.lastIndexOf('/'),
          dirName = dir.substr(lastIndexOf+1);
      console.log("finished " + dirName);
      // Success, we're done. Hit the callback.
      cb(null,dir);
    })
    .catch((e) => {
      if (e.message === 'noSass' || e.message === "noGulpfile") {
        var lastIndexOf = dir.lastIndexOf('/'),
            dirName = dir.substr(lastIndexOf+1);

        console.log("couldn't find " + e.message + " inside " + dirName);
        cb(null,dir);
      } else {
        console.log(e);
      }
    });
  };

  return {
    main : main
  };
})();

module.exports = {
  main: rebuildSass.main
};
