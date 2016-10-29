
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    fileExists = require('file-exists');


var updateDependency = (function() {

  var change = function(dir) {
    console.log(dir + '/bower.json');

    let doesFileExist = fileExists(dir + '/bower.json');
    if (!doesFileExist) return Promise.resolve(dir);

    return fs.readJsonAsync(dir + '/bower.json')
      .then((bower) => {
        console.log('have bower' + dir);
        if (bower.dependencies && bower.dependencies.polymer) {
          console.log('have polymer');
          bower.dependencies.polymer = "^1.7.0";
        }
        return Promise.resolve(bower);
      })
      .then((bower) => {
        console.log('write json ' + dir);
        return fs.writeJson(dir + '/bower.json', bower, (e) => Promise.resolve());
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
  main: updateDependency.main
};
