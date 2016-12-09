
var Promise = require('bluebird'),
    shared = require('../lib/shared'),
    fs = Promise.promisifyAll(require('fs-extra')),
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
  var changeTextInFile = function(dir) {
    console.log(`Reading ${dir}...`);
    var searchTextArr = [`$ grunt sass`,'$ grunt depserve', 'By default grunt watch', `Your browser will also need to have the LiveReload extension installed and enabled. For instructions on how to do this please refer to: [livereload.com/extensions/](http://livereload.com/extensions/).

Disable LiveReload by removing the \`livereload\` key from the configuration object or explicitly setting it to false.`,
`### DevMode
Devmode runs \`grunt depserve\` and \`grunt watch\` concurrently so that when you make a change to your source files and save them, your preview will be updated in any browsers you have opened and turned on LiveReload.
From the component's directory run:

\`\`\`
$ grunt devmode
\`\`\``],
searchTextArrRegEx = [`\\$ grunt sass`,'\\$ grunt depserve', 'By default grunt watch', `Your browser will also need to have the LiveReload extension installed and enabled\. For instructions on how to do this please refer to: \\[livereload\.com\/extensions\/\\]\\(http:\/\/livereload\.com\/extensions\/\\)\.

Disable LiveReload by removing the \`livereload\` key from the configuration object or explicitly setting it to false\.`,
`### DevMode
Devmode runs \`grunt depserve\` and \`grunt watch\` concurrently so that when you make a change to your source files and save them, your preview will be updated in any browsers you have opened and turned on LiveReload\.
From the component's directory run:

\`\`\`
\\$ grunt devmode
\`\`\``],
        regExArr = searchTextArrRegEx.map((term) => {
          return new RegExp(term, "g");
        }),
        replaceTextArr = [`$ gulp sass`, '$ gulp serve', 'By default gulp serve', '',''];
        var updatedText;
        return fs.readFileAsync(dir + "/README.md", "utf-8")
          .then((fileText) => {
            //make sure we capture our changes

            console.log(`Looking at ${dir} file text...`);
            return Promise.each(regExArr, (term,i) => {
              if (updatedText) {
                fileText = updatedText;
              }
              if (fileText.indexOf(searchTextArr[i]) > -1) {
                console.log(`Found ${dir} file text...`);
                updatedText = fileText.replace(term, replaceTextArr[i]);
                return fs.writeFileAsync(dir + "/README.md", updatedText, {spaces: 2})
                  .then(() => {
                    console.log(`Rewrote ${dir} README file...`);
                    return Promise.resolve();
                  });
              } else {
                console.log(`No ${dir} README text found...`);
                return Promise.resolve();
              }
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
    shared.doesFileExist(dir, 'README.md')
    .then((fileExists) => {
      // If there's no bower.json file, callback immediately and stop messing with this directory.
      if (!fileExists) {
        cb(null);
      } else {
        return changeTextInFile(dir)
        .then(() => {
          // Success, we're done. Hit the callback.
          cb(null,dir);
        });
      }
    });
  };

  return {
    main : main
  };
})();

module.exports = {
  main: changeTextInFile.main
};
