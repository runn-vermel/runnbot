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

    if (typeOfBump === 'patch') {
      updatedVersiony = versiony.patch();
    } else if (typeOfBump === 'minor'){
      updatedVersiony = versiony.minor();
    } else if (typeOfBump === 'major') {
      updatedVersiony = versiony.major();
    }

    dirList.forEach(function(dir) {
      //console.log(dir);
      process.chdir(dir);
      console.log(dir);
      try {
        updatedVersiony
        .from('bower.json')
        .to('bower.json')
        .to('package.json')
        .end();
        updateHistory(updatedVersiony.version, dir, message,localPath);
      }
      catch(e) {
        return;
      }
    }.bind(this));
  }
  function updateHistory(version, dir, message, localPath) {
    process.chdir(dir);
    //console.log('update ' + dir);
    try {
      var data = fs.readFileSync(dir + '/HISTORY.md'); //read existing contents into data
      console.log('data = ' + data)
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
    catch(e) {
      return;
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
