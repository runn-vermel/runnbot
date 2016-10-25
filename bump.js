var fs = require("fs");
var versiony = require('versiony');
var prependFile = require('prepend-file');
var types= {
  patch: function() {
    versiony.path();
  },
  minor: function(){
    versiony.minor();
  },
  major: function() {
    versiony.major();
  }
};
function bump(localPath, typeOfBump, message) {
  var dirList=[];
  function getDirs(localPath, typeOfBump, message) {
    fs.readdir(__dirname + "/" + localPath, function (err, files) {
      if (err) errFunction(err);

      dirList = files
        .map(function (file) {
          return __dirname + "/" + localPath + "/" +file;
        })
        .filter(function (file) {
          return file.substr(0, 1) !== "." && !fs.statSync(file).isFile();
        }
      );
      loopThroughRepos(dirList, typeOfBump, message, localPath);
    });
  }

  function loopThroughRepos(dirList, typeOfBump, message, localPath) {
    var versionyInst,
        updatedVersiony;

    // if (typeOfBump === 'patch') {
    //   versionyInst = versiony.patch();
    // } else if (typeOfBump === 'minor'){
    //   versionyInst = versiony.minor();
    // } else if (typeOfBump === 'major') {
    //   versionyInst = versiony.major();
    // }

    dirList.forEach(function(dir) {
      //console.log(dir);
      process.chdir(dir);

        if (doesFileExist(dir + '/bower.json')) {
        updatedVersiony = versiony[typeOfBump]()
          .from('bower.json')
          .to('bower.json')
          .end();
        }

        if (doesFileExist(dir + '/package.json')) {
          updatedVersiony = versiony[typeOfBump]()
          .from('package.json')
          .to('package.json')
          .end();
        }
        updateHistory(updatedVersiony.version, dir, message,localPath);
    }.bind(this));
  }

  function doesFileExist(path) {
    try {
      return fs.statSync(path).isFile();
    } catch (e) {
      if (e.code === 'ENOENT') {
        return false;
      } else {
        throw e;
      }
    }
  }
  function updateHistory(version, dir, message, localPath) {
    process.chdir(dir);
    //console.log('update ' + dir);
    if (doesFileExist(dir + '/HISTORY.md')) {
      var PrependMessage = `
        v${version}
        ==================
        * ${message}

        `;
      prependFile(dir + '/HISTORY.md', PrependMessage, function(err) {
        if (err) {
          errFunction(err);
        }
        // Success
      });
    }
  }
  function errFunction(err) {
    console.log(err);
  }

  function main(localPath, typeOfBump, message) {
    getDirs(localPath, typeOfBump, message);
  }
  return {
    main:main
  };
}

exports.main = function(localPath, typeOfBump, message) {
  return bump().main(localPath, typeOfBump, message);
};
