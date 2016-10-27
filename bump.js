var fs = require("fs");
var versiony = require('versiony');
var prependFile = require('prepend-file');
var shared = require('./shared');

var bump = (function() {

  function loopThroughRepos(err, dirList) {
    if (err) shared.errFunction(err);

    var updatedVersiony;

    dirList.forEach(function(dir) {
      //console.log(dir);
      process.chdir(dir);
        bump = (shared.typeOfBump === "major") ? "newMajor" : shared.typeOfBump;
        console.log('bump =' + bump);
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
        shared.updatedVersion = updatedVersiony.version;
        updateHistory(dir);
    });
  }


  function updateHistory(dir) {
    process.chdir(dir);
    if (shared.doesFileExist(dir + '/HISTORY.md')) {
      var PrependMessage = `
        v${shared.updatedVersion}
        ==================
        * ${shared.message}

        `;
      prependFile(dir + '/HISTORY.md', PrependMessage, function(err) {
        if (err) {
          shared.errFunction(err);
        }
        // Success
      });
    }
  }

  function main() {
    shared.getDirs(loopThroughRepos);
  }
  return {
    main: main
  };
})();

module.exports = {
  main: bump.main
};
