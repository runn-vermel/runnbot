
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra'));


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
    var includeText = '<style include="px-theme-styles"></style>',
        regEx = new RegExp(includeText, "g");
    return fs.readdirAsync(dir)
    .then((files) => files.filter((file) => (file !== "index.html" && file !=="demo.html")))
    .then((files) => files.filter((fileOrDir) => fileOrDir.substr(0, 1) !== "." && fs.statSync(dir + "/" + fileOrDir).isFile()))
    .then((files) => {

    return Promise.each(files, (file) => {
      return fs.readFileAsync(dir + "/" + file, "utf-8")
               .then((fileText) => {

                if (fileText.indexOf(includeText) > -1) {
                  var updatedText = fileText.replace(regEx, '');
                  fs.writeFileAsync(dir + "/" + file, updatedText)
                  .then(() => Promise.resolve());
                } else {
                  return Promise.resolve();
                }
              });
    });
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
    removeTextFromFile(dir).then((r) => {
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
