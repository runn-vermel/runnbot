var fs = require("fs");
var versiony = require('versiony');
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

    if (typeOfBump === 'patch') {
      versionyInst = versiony.patch();
    } else if (typeOfBump === 'minor'){
      versionyInst = versiony.minor();
    } else if (typeOfBump === 'major') {
      versionyInst = versiony.major();
    }

    dirList.forEach(function(dir) {
      //console.log(dir);
      process.chdir(dir);
      console.log(dir);
      versionyInst
      .from('bower.json');

        if (doesFileExist(dir + '/bower.json')) {
          versionyInst.to('bower.json');
        }

        if (doesFileExist(dir + '/package.json')) {
          versionyInst.to('package.json');
        }

        updatedVersiony = versionyInst.end();

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
    console.log('history = ' + dir);
    //console.log('update ' + dir);
    if (doesFileExist(dir + '/HISTORY.md')) {
      var file = dir + '/HISTORY.md';
      var data = fs.readFileSync(file); //read existing contents into data
      var fd = fs.openSync(file, 'w+');
      var buffer = new Buffer(`
        v${version}
        ==================
        * ${message}

        `
      );
      fs.writeSync(fd, buffer, 0, buffer.length); //write new data
      fs.writeSync(fd, data, buffer.length, data.length); //append old data
      //or fs.appendFile(fd, data);

      fs.close(fd);
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
