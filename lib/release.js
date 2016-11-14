var shared = require("./shared");
var Promise = require("bluebird");
var git = require("git-promise");
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
    debugger;

    var pb = new shared.ProgressBar(dirList.length);

    return Promise.map(dirList, function(dirObj) {
      return gitAction(dirObj)
      .then((dirObj) => {
        pb.uptickProgressBar();
        return Promise.resolve(dirObj);
      });
    },  {concurrency: int=9});
  };

  /**
   * does a git add, commit, tag, push and push tag on the requested dir.
   * @param  {[Object]} dirObj [an object which contains the dir path, and the updated version]
   * @return {[Promise]}        [a list of dirs that have successfully done all the git stuff]
   */
  var gitAction = function(dirObj, dirList) {
    var dir = dirObj.dir,
        tag = "v" + dirObj.version,
        index = dir.lastIndexOf("/"),
        repoName = dir.substr(index + 1),
        //we need to supply username/password to Github for permissions to push.
        repoUrl = "https://" + shared.username + ":" + shared.password + "@github.com/PredixDev/"+ repoName + ".git";

      return git('config user.name "RunnBot"')
      .then(() => git('config user.email "runnbot@ge.com"'))
      .then(() => git('add .', {cwd: dir}))
      .then(() => git('commit -m "' + shared.message + '"', {cwd: dir}) )
      .then(() => git('tag ' + tag, {cwd: dir}))
      .then(() => git('push --repo=' + repoUrl , {cwd: dir}))
      .then(() => git('push ' + repoUrl + ' ' + tag, {cwd: dir}))
      .then(() => Promise.resolve(dirObj));

      // return shared.simpleGit(dir)
      // .addConfig('user.name', 'Runnbot')
      // .addConfig('user.email', 'runnbot@ge.com')
      // .add('.')
      // .commit(shared.message)
      // .addTag(tag)
      // .push(repoUrl)
      // .pushTags(repoUrl)
      // .then(() => {
      //   debugger;
      //   return Promise.resolve(dirObj);
      // });

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
