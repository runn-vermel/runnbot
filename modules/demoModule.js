
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    fileExists = require('file-exists');


/**
 * our IIFE function
 */
var updateDependency = (function() {

  /**
   * changes the Dependency for polymer to 1.7.0 for the given repo/dir
   * @param  {[String]} dir [a full path to a repo]
   * @return {[Promise]}     [a resolved promise]
   */
  var changeDependencyVersion = function(dir) {
    //check if bower exists, and if not, resolve the promise without doing anything.
    let doesFileExist = fileExists(dir + '/bower.json');
    if (!doesFileExist) return Promise.resolve(dir);

    return fs.readJsonAsync(dir + '/bower.json')
      .then((bower) => {
        //make sure bower has dependencies and a polymer parameter.
        if (bower.dependencies && bower.dependencies.polymer) {
          bower.dependencies.polymer = "^1.7.0";
        }
        //don't forget to return the resolved promise - which is picked up next
        return Promise.resolve(bower);
      })
      //resolved promise is picked up here
      .then((bower) => {
        //and bower is async written back. by promisifying everything inside the fs-extra lib, we ensure we get a promise back our of any fs method.
        return fs.writeJsonAsync(dir + '/bower.json', bower);
      });
  };

  /**
   * our Main function. calls the changeDependencyVersion function, and once that's done, calls the callback (cb), which doesn't actually do anything
   * but is needed for this module to be promisified.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {
    changeDependencyVersion(dir).then((r) => {
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
