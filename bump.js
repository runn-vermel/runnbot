var fs = require("fs");
var versiony = require('versiony');
var prependFile = require('prepend-file');
var shared = require('./shared');

var bump = (function() {
  var message,
      typeOfBump;

  function loopThroughRepos(err, dirList) {
    if (err) shared.errFunction(err);

    var updatedVersiony;

    dirList.forEach(function(dir) {
      //console.log(dir);
      process.chdir(dir);

        if (shared.doesFileExist(dir + '/bower.json')) {
        updatedVersiony = versiony[typeOfBump]()
          .from('bower.json')
          .to('bower.json')
          .end();
        }

        if (shared.doesFileExist(dir + '/package.json')) {
          updatedVersiony = versiony[typeOfBump]()
          .from('package.json')
          .to('package.json')
          .end();
        }
        updateHistory(updatedVersiony.version, dir);
    });
  }


  function updateHistory(version, dir) {
    process.chdir(dir);
    if (shared.doesFileExist(dir + '/HISTORY.md')) {
      var PrependMessage = `
        v${version}
        ==================
        * ${message}

        `;
      prependFile(dir + '/HISTORY.md', PrependMessage, function(err) {
        if (err) {
          shared.errFunction(err);
        }
        // Success
      });
    }
  }

  function main(ltypeOfBump, lmessage) {

    typeOfBump = ltypeOfBump;
    message = lmessage;
    shared.getDirs(loopThroughRepos);
  }
  return {
    main: main
  };
})();

module.exports = {
  main: bump.main
};
