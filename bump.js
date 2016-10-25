var fs = require("fs");
var versiony = require('versiony');
var prependFile = require('prepend-file');

var bumpVersion = {
    getDirs: function() {
      var dirList=[];
      fs.readdir(__dirname + "/" + this.localPath, function (err, files) {
       if (err) this.errFunction(err);

       dirList = files
         .map(function (file) {
           return __dirname + "/" + this.localPath + "/" +file;
         }.bind(this))
         .filter(function (file) {
           return file.substr(0, 1) !== "." && !fs.statSync(file).isFile();
         }.bind(this)
       );
       this.loopThroughRepos(dirList);
      });
   },
   loopThroughRepos: function(dirList) {
    var updatedVersiony;

    dirList.forEach(function(dir) {
      //console.log(dir);
      process.chdir(dir);

        if (doesFileExist(dir + '/bower.json')) {
        updatedVersiony = versiony[this.typeOfBump]()
          .from('bower.json')
          .to('bower.json')
          .end();
        }

        if (doesFileExist(dir + '/package.json')) {
          updatedVersiony = versiony[this.typeOfBump]()
          .from('package.json')
          .to('package.json')
          .end();
        }
        updateHistory(updatedVersiony.version, dir, this.message, this.localPath);
    }.bind(this));
  },
  doesFileExist: function(path) {
   try {
     return fs.statSync(path).isFile();
    } catch (e) {
      if (e.code === 'ENOENT') {
       return false;
      } else {
       throw e;
      }
    }
  },
  updateHistory: function(version, dir) {
  process.chdir(dir);
  if (doesFileExist(dir + '/HISTORY.md')) {
    var PrependMessage = `
      v${version}
      ==================
      * ${this.message}

      `;
    prependFile(dir + '/HISTORY.md', PrependMessage, function(err) {
      if (err) {
        this.errFunction(err);
      }
      // Success
    });
  }
  },
  errFunction: function(err) {
    console.log(err);
  },
  main: function(localPath, typeOfBump, message) {
    this.localPath = localPath;
    this.typeOfBump = typeOfBump;
    this.message = message;
    this.getDirs();
    return null;
  }
};

module.exports = bumpVersion.main;
