var fs = require("fs");
var versiony = require('versiony');
var prependFile = require('prepend-file');
var shared = require('./shared');
var Promise = require("bluebird");
var fileExists = require('file-exists');
var bump = (function() {

  function loopThroughRepos(dirList) {
    console.log('loopThroughRepos');
    return Promise.all(dirList.map(function(dir) {
      return bump(dir).then(updateHistory);
    }));
  }

  function bump(dir) {
      var bump = (shared.bump === "major") ? "newMajor" : shared.bump;
      var updatedVersiony;
      if (fileExists(dir + '/bower.json')) {
      updatedVersiony = versiony
        .from(dir + '/bower.json')
        [bump]()
        .to(dir + '/bower.json')
        .end();
      }

      if (fileExists(dir + '/package.json')) {
        updatedVersiony = versiony
        .from(dir + '/package.json')
        [bump]()
        .to(dir + '/package.json')
        .end();
      }
      return Promise.resolve({updatedVersion: updatedVersiony, dir:dir});
  }

  function updateHistory(obj) {
    var dir = obj.dir;
    var updatedVersion = obj.updatedVersion;
    if (fileExists(dir + '/HISTORY.md')) {
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

  function main(dirList) {
    console.log('bump');
    return loopThroughRepos(dirList)
    .error(shared.errFunction);
  }
  return {
    main: main
  };
})();

module.exports = {
  main: bump.main
};
