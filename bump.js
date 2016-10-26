var fs = require("fs");
var versiony = require('versiony');
var prependFile = require('prepend-file');
var bump = (function() {
  var localPath,
      message,
      typeOfBump;

  function getDirs() {
    var dirList=[];
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
     loopThroughRepos(dirList);
    });
 }

  function loopThroughRepos(dirList) {
    var updatedVersiony;

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
        updateHistory(updatedVersiony.version, dir, message, localPath);
    });
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

  function updateHistory(version, dir) {
    process.chdir(dir);
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

  function main(llocalPath, ltypeOfBump, lmessage) {
    //update the global vars with what was passed it.
    localPath = llocalPath;
    typeOfBump = ltypeOfBump;
    message = lmessage;
    getDirs();
  }
  return {
    main: main
  };
})();

module.exports = {
  main: bump.main
};
