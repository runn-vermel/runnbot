var shared = require("./shared");

var release = (function() {
  var gitActions = function(err, dirList) {
    dirList.forEach(function(dir) {
      process.chdir(dir);
      var index = dir.lastIndexOf("/"),
          repoName = dir.substr(index + 1),
          repoUrl = "https://" + shared.username + ":" + shared.password + "@github.com/PredixDev/"+ repoName + ".git",
          tag = require(dir + "/bower.json").version;
          
      shared.simpleGit()
      .addConfig('user.name', 'Runnbot')
      .addConfig('user.email', 'runnbot@ge.com')
      .add('.')
      .commit(shared.message)
      .addTag(tag, shared.errFunction(err))
      .push(repoUrl ,'master', shared.errFunction(err))
      .pushTags('origin');
    });
  };

  var main = function() {
    shared.getDirs(gitActions);
  };

  return {
    main: main
  };
})();

module.exports = {
  main:release.main
};
