
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

    var isFileOrDir = function(firOrDir) {

    };




    return fs.readdirAsync(reposDir)
        // Only return files that are a directory
        .filter((fileName) => fs.statAsync(`${reposDir}/${fileName}`).then((stat) => stat.isDirectory()) )
        .filter((fileName) => {
          // Only return files that are in the whitelist, if there is a whitelist
          if (whitelist.length) return Promise.resolve(whitelist.indexOf(fileName) !== -1);
          // If no whitelist, return all files
          return Promise.resolve(true);
        })
        .then((repos) => {
          debugger;
          if (repos.length) return Promise.resolve(repos);
          return Promise.reject(new Error(`No repos found in directory ${chalk.bold(reposDir)}. Please make sure you are running the search in the correct directory.`))
        });












    return fs.readdirAsync(dir)
    .filter((file) => (file !== "index.html" && file !=="demo.html"))
    .filter((fileOrDir) => fileOrDir.substr(0, 1) !== ".")gits

    .filter((filename) => fs.statAsync(`${dir}/${filename}`).then((stat) => stat.isFile()) )
    .then((files) => {

    return Promise.each(files, (file) => {
      return fs.readFileAsync(dir + "/" + file, "utf-8")
               .then((fileText) => {

                if (fileText.indexOf(includeText) > -1) {
                  var updatedText = fileText.replace(regEx, '');
                  fs.writeFileAsync(dir + "/" + file, updatedText, {spaces: 2})
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
