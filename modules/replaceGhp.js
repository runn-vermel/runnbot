
var Promise = require('bluebird'),
    shared = require('../lib/shared');



/**
 * our IIFE function
 */
var runScript = (function() {

  /**
   * Runs the shell script per repo
   * @return {[Promise]} [either resolve or reject.]
   */
  var runScript = function(dir) {
    shared.execAsync('', dir)
    .then(() => Promise.resolve());
  };

  /**
   * our Main function. calls the runScript function, and once that's done, calls the callback (cb), which doesn't actually do anything
   * but is needed for this module to be promisified.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {

    return runScript(dir)
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
  main: runScript.main
};
