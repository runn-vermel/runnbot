var shared = require('./shared'),
    Promise = require('bluebird');

 /**
 * our IIFE function
 */
var createChangedRepoList = (function() {

  /**
   * loops through all the firs, and runs the checkDir function on each one.
   * @param  {[Array]} dirlist [An array that holds a list of dirs]
   * @return {[Promise]}         [returns a promise which holds an array of all the repos that were changed]
   */
  var createChangedRepoList = function(dirlist) {
    return Promise.all(dirlist.map(function(dir) {
      return checkDir(dir);
    }));
  };

  /**
   * The changed repo list returns an array of either dirs that are changed, or NULLs. This function filters out the nulls.
   * @param  {[Array]} dirList [An array of changed repos, and nulls]
   * @return {[Promise]}         [an array of changed repos]
   */
  var removeNullFromList = function(dirList) {
      return dirList.filter((dir) => dir !== null);
  };

  /**
   * Checks whether the status of the repo in question has anything in its modified property, and returns the dir if it does
   * and null if it doesn't.
   * @param  {[String]} dir [Full Repo Path]
   * @return {[Promise]}     [either the dir path or Null, depending on whether the repo has changed.]
   */
  var checkDir = function(dir) {
    var simpleGitInstance = shared.simpleGit(dir),
        checker = Promise.promisify(simpleGitInstance.status, {context:simpleGitInstance});
    return checker()
    .then((status) => (status.modified.length) ? Promise.resolve(dir) : Promise.resolve(null));
  };

  var main = function(dirList) {
      return createChangedRepoList(dirList)
      .then(removeNullFromList);
  };

  return {
     main: main
  };
})();

module.exports = {
  main: createChangedRepoList.main
};
