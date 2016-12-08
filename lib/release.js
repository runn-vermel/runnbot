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

    var pb = new shared.ProgressBar(dirList.length);

    return Promise.map(dirList, function(dirObj) {
      return gitAction(dirObj)
      .then((dirObj) => {
        var lastSlash = dirObj.dir.lastIndexOf("/"),
            dirName = dirObj.dir.substr(lastSlash+1);
        pb.uptickProgressBar(dirName);
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
    var dir,
        version,
        tag;
    //if we aren't tagging, the object isn't created, and there's only the dir path.
    if (typeof dirObj == "string") {
      dir = dirObj;
    } else {
      dir = dirObj.dir;
      tag = "v" + dirObj.version;
    }

    var index = dir.lastIndexOf("/"),
        repoName = dir.substr(index + 1),
        //we need to supply username/password to Github for permissions to push.
        repoUrl = "https://" + shared.username + ":" + shared.password + "@github.com/PredixDev/"+ repoName + ".git";

      return git('add .', {cwd: dir})
      .then(() => git('commit -m "' + shared.message + '"', {cwd: dir}) )
      .then(() => {
        // we only set the tag if noTag is false (which is it by default)
        if (!shared.noTag) {
          git('tag ' + tag, {cwd: dir});
        } else {
          return Promise.resolve();
        }
      })
      .then(() => git('push --repo=' + repoUrl , {cwd: dir}))
      .then(() => {
        if (!shared.noTag) {
          git('push ' + repoUrl + ' ' + tag, {cwd: dir});
        } else {
          return Promise.resolve();
        }
      })
      .then(() => Promise.resolve(dirObj));

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
