
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    fileExists = require('file-exists');


/**
 * our IIFE function
 */
var updateBrowser = (function() {

  /**
   * changes the Dependency for polymer to 1.7.0 for the given repo/dir
   * @param  {[String]} dir [a full path to a repo]
   * @return {[Promise]}     [a resolved promise]
   */
  var updateBrowser = function(dir) {
    //check if bower exists, and if not, resolve the promise without doing anything.
    let doesFileExist = fileExists(dir + '/wct.conf.json');
    if (!doesFileExist) return Promise.resolve(dir);

    return fs.readJsonAsync(dir + '/wct.conf.json')
      .then((wct) => {
        //make sure bower has dependencies and a polymer parameter.
        // if your condition is met, resolve the promise with 2 parameters: bower, and changed.
        if (wct && wct.hasOwnProperty('plugins') && wct.plugins.hasOwnProperty('sauce') && wct.plugins.sauce.hasOwnProperty('browsers') && wct.plugins.sauce.browsers.length) {
          wct.plugins.sauce.browsers.forEach((browser) => {
            if (browser.browserName === "safari" && browser.version === "8") {
              browser.version = "10";
              browser.platform = "OS X 10.11";
            }
          });
          return Promise.resolve({wct:wct, changed: true});
        } else {
          return Promise.resolve({wct:wct, changed: false});
        }
        //don't forget to return the resolved promise - which is picked up next

      })
      //resolved promise is picked up here
      .then((obj) => {
        //and bower is async written back if changed is true. by promisifying everything inside the fs-extra lib, we ensure we get a promise back our of any fs method.
        return (obj.changed) ? fs.writeJsonAsync(dir + '/wct.conf.json', obj.wct, {spaces: 2}) : Promise.resolve();
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
    updateBrowser(dir).then((r) => {
      cb(null,'this is what returns');
    });
  };
  return {
    main : main
  };
})();

module.exports = {
  main: updateBrowser.main
};
