
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    fileExists = require('file-exists');


var targetRepo = (function() {

  var change = function(dir) {
    let doesFileExist = fileExists(dir + '/bower.json');
    if (!doesFileExist) return Promise.resolve(dir);

    return fs.readJsonAsync(dir + '/bower.json')
      .then((bower) => {
        if (bower.name && bower.name === "px-demo-snippet") {
          console.log('have bower' + dir);
          console.log('have polymer');
          bower.dependencies.polymer = "^1.7.0";
        }
        return Promise.resolve(bower);
      })
      .then((bower) => {
        if (bower.name && bower.name === "px-demo-snippet") {
          console.log('write json ' + dir);
          return fs.writeJson(dir + '/bower.json', bower, (e) => Promise.resolve());
        } else {
          return Promise.resolve();
        }
      });
  };

  var main = function(dir, cb) {
    change(dir).then((r) => {
      cb(null,'this is what returns');
    });
  };
  return {
    main : main
  };
})();

module.exports = {
  main: targetRepo.main
};
