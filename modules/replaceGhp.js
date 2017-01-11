
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    path = require('path');


/**
 * our IIFE function
 */
var replaceGhp = (function() {

  /**
   * Reads the contents of the sample GHP shell script
   * @return {[Promise]} [contents of the sample GHP shell script]
   */
  var readNewGhp = function(dir) {
    console.log('process.cwd = ' + process.cwd());
    var pathToGhp = path.join(process.cwd(), '../modules/ghp.sh');
    return fs.readFileAsync(pathToGhp, "utf-8");
  };

  /**
   *
   * This method takes in the new ghp shell script, and replaces the contents of the existing
   * shell script
   * @method replaceGhp
   * @param newGhp - the full GHP shell script
   */
   var replaceGhp = function(newGhp, dir) {
    if (shared.doesFileExist(dir + '/scripts/', 'ghp.sh')) {
      return fs.writeFileAsync(dir + '/scripts/ghp.sh', newGhp, 'utf8');
    } else {
      return Promise.resolve();
    }
   };
  /**
   * our Main function. calls the runScript function, and once that's done, calls the callback (cb), which doesn't actually do anything
   * but is needed for this module to be promisified.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {

    return readNewGhp(dir)
    .then((newGhp) => replaceGhp(newGhp, dir))
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
  main: replaceGhp.main
};
