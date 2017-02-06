/**
 * our IIFE function
 */
var emptyCallback = (function() {

  /**
   * our Main function. calls the checkForTravisFile to check that we have a travis file in the repo.
   * if it does, add the key, if not, move on.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {
    cb(null,dir);
  };

  return {
    main : main
  };
})();

module.exports = {
  main: emptyCallback.main
};
