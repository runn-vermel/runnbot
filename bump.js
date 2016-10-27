var fs = require("fs");
var versiony = require('versiony');
var prependFile = require('prepend-file');
var shared = require('./shared');
var Promise = require("bluebird");
var bump = (function() {

  function loopThroughRepos(dirList) {
    return Promise.all(dirList.map(function(dir) {
      return bump(dir).then(updateHistory);
    }));
  }

  function bump(dir) {
    process.chdir(dir);
      var bump = (shared.typeOfBump === "major") ? "newMajor" : shared.typeOfBump;
      var updatedVersiony;
      if (shared.doesFileExist(dir + '/bower.json')) {
      updatedVersiony = versiony
        .from('bower.json')
        [bump]()
        .to('bower.json')
        .end();
      }

      if (shared.doesFileExist(dir + '/package.json')) {
        updatedVersiony = versiony
        .from('package.json')
        [bump]()
        .to('package.json')
        .end();
      }
      return Promise.resolve({updatedVersion: updatedVersiony, dir:dir});
  }

  function updateHistory(obj) {
    var dir = obj.dir;
    var updatedVersion = obj.updatedVersion;
    process.chdir(dir);
    if (shared.doesFileExist(dir + '/HISTORY.md')) {
      var PrependMessage = `
        v${updatedVersion.version}
        ==================
        * ${shared.message}

        `;
      var prependFileAsync = Promise.promisify(prependFile);

      return prependFileAsync(dir + '/HISTORY.md', PrependMessage).then(function() {
        return Promise.resolve({dir:dir, version:updatedVersion.version});
      }).error(shared.errFunction);
    }
  }

  function main() {
    return shared.getDirs().then(loopThroughRepos)
    .error(shared.errFunction);
  }
  return {
    main: main
  };
})();

module.exports = {
  main: bump.main
};
