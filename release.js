var shared = require("./shared");
var Promise = require("bluebird");

var release = (function(dirList) {
  var loopThroughDirs = function(dirList) {
    return Promise.all(dirList.map(function(dir) {
      return gitAction(dir);
    }));
  };

  var gitAction = function(dirObj) {
    var dir = dirObj.dir;
    var tag = dirObj.version;
    process.chdir(dir);
    var index = dir.lastIndexOf("/"),
        repoName = dir.substr(index + 1),
        repoUrl = "https://" + shared.username + ":" + shared.password + "@github.com/PredixDev/"+ repoName + ".git";

    return shared.simpleGit()
    .addConfig('user.name', 'Runnbot')
    .addConfig('user.email', 'runnbot@ge.com')
    .add('.')
    .commit(shared.message)
    .addTag(tag, shared.errFunction)
    .push(repoUrl ,'master', shared.errFunction)
    .pushTags('origin')
    .then(function() {
      return Promise.resolve(dir);
    });
  };

  var main = function(dirList) {
    return loopThroughDirs(dirList)
    .error(shared.errFunction);
  };

  return {
    main: main
  };
})();

module.exports = {
  main:release.main
};
