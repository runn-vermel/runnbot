var shared = require("./shared");
var Promise = require("bluebird");

/**
 * our IIFE function
 */
var release = (function(dirList) {

  /**
   * loops through all the dirs in the supplised dir list and calls gitAction on each one, returning an array of completed dirs path.
   * @param  {[Array]} dirList [a list of dirs]
   * @return {[Promise]}         [a list of dirs that have succesfully git updated and pushed]
   */
  var loopThroughDirs = function(dirList) {
    var pb = shared.ProgressBar(dirList.length);
    return Promise.all(dirList.map((dirObj) => gitAction(dirObj).then((dirObj) => {
      pb.uptickProgressBar();
      return Promise.resolve(dirObj);
    })));
  };

  /**
   * does a git add, commit, tag, push and push tag on the requested dir.
   * @param  {[Object]} dirObj [an object which contains the dir path, and the updated version]
   * @return {[Promise]}        [a list of dirs that have successfully done all the git stuff]
   */
  var gitAction = function(dirObj) {
    var dir = dirObj.dir,
        tag = "v" + dirObj.version,
        index = dir.lastIndexOf("/"),
        repoName = dir.substr(index + 1),
        //we need to supply username/password to Github for permissions to push.
        repoUrl = "https://" + shared.username + ":" + shared.password + "@github.com/PredixDev/"+ repoName + ".git";

    shared.simpleGit(dir)
    .addConfig('user.name', 'Runnbot')
    .addConfig('user.email', 'runnbot@ge.com')
    .add('.')
    .commit(shared.message)
    .addTag(tag)
    .push(repoUrl ,'master', (e) => {
      console.log('in push = ' + e);
    })
    .pushTags(repoUrl, (e) => {
      if (e) {
        console.log(e);
        return Promise.reject(e);
      }
      return Promise.resolve(dirObj);
    });
  };

  /**
   * Our Main function, calls loopThroughDirs
   * @param  {[Array]} dirList [an array of objects, each containing the dir path, and the updated bower version]
   * @return {[Promise]}         [a list of dirs that have successfully done all the git stuff ]
   */
  var main = function(dirList) {
    return loopThroughDirs(dirList);
  };

  return {
    main: main
  };
})();

module.exports = {
  main:release.main
};
