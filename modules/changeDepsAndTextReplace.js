
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
    fileExists = require('file-exists'),
    IsThere = require("is-there");


/**
 * our IIFE function
 */
var changeTextInFile = (function() {

  /**
   * removes the specified text from a file.
   * @param  {[String]} dir [a full path to a repo]
   * @return {[Promise]}     [a resolved promise]
   */
  var removeTextFromFile = function(dir) {
    var initialDir = dir;
    var searchText = `<link rel="import" href="../../px-theme/px-theme.html"/>`,
        regEx = new RegExp(searchText, "g"),
        replaceText = `<link rel="import" href="../../px-theme/px-theme-styles.html">
    <style include="px-theme-styles" is="custom-style"></style>`;


    return  fs.readdirAsync(dir + "/test")
    .then((files) => files.filter((file) => (file.substring(file.length-12) == "fixture.html")))
    //.then((files) => files.filter((fileOrDir) => fileOrDir.substr(0, 1) !== "." && fs.statSync(dir + "/" + fileOrDir).isFile()))
    .then((files) => {

    return Promise.each(files, (file) => {
      return fs.readFileAsync(dir + "/test/" + file, "utf-8")
               .then((fileText) => {
                if (fileText.indexOf(searchText) > -1) {
                  var updatedText = fileText.replace(regEx, replaceText);
                  fs.writeFileAsync(dir + "/test/" + file, updatedText, {spaces: 2})
                  .then(() => Promise.resolve(initialDir));
                } else {
                  return Promise.resolve(initialDir);
                }
              });
    });
  });
  };

  var changeDeps = function(dir) {


    let doesFileExist = fileExists(dir + '/bower.json');
    if (!doesFileExist) return Promise.resolve(dir);

    return fs.readJsonAsync(dir + '/bower.json')
      .then((bower) => {
        //make sure bower has dependencies and a polymer parameter.
        // if your condition is met, resolve the promise with 2 parameters: bower, and changed.
        if ((bower.devDependencies && bower.devDependencies["px-theme"]) || (bower.dependencies && bower.dependencies["px-theme"])) {
           if (bower.devDependencies["px-theme"]) {
             bower.devDependencies["px-theme"] = "^2.0.1";
           }

           if (bower.dependencies["px-theme"]) {
                    bower.dependencies["px-theme"] = "^2.0.1";
           }

          return Promise.resolve({bower:bower, changed: true});
        } else {
          return Promise.resolve({bower:bower, changed: false});
        }
        //don't forget to return the resolved promise - which is picked up next

      })
      //resolved promise is picked up here
      .then((obj) => {
        //and bower is async written back if changed is true. by promisifying everything inside the fs-extra lib, we ensure we get a promise back our of any fs method.
        if (obj.changed) {
          return fs.writeJsonAsync(dir + '/bower.json', obj.bower, {spaces: 2})
                    .then(() => Promise.resolve(dir));
        } else {
          return Promise.resolve(dir);
        }
      });
  };

  /**
   * our Main function. calls the removeTextFromFile function, and once that's done, calls the callback (cb), which doesn't actually do anything
   * but is needed for this module to be promisified.
   * @param  {[String]}   dir [a full path to a repo]
   * @param  {Function} cb  [a dummy callback, needed to promisify this module]
   * @return {[Promise]}       [returns a resolved promise.]
   */
  var main = function(dir, cb) {
    IsThere(dir + "/test", function(res) {
      if  (!res) {
        Promise.resolve(dir);
      }
    });

    changeDeps(dir)
    .then((dir) => removeTextFromFile(dir))
    .then((r) => {
      cb(null,'this is what returns');
    });
  };
  return {
    main : main
  };
})();

module.exports = {
  main: changeTextInFile.main
};
