var shared = require('./shared'),
    Promise = require("bluebird"),
    fs = Promise.promisifyAll(require('fs-extra'));

/**
 * our IIFE function
 */
var generateReport = (function() {
  var line = '',
      reportPath='';

  /**
   * Loops through the dirList, and calls generateRepoLine on each item in there.
   * @param  {[Array]} dirList [an array of objects, each containing the full path and updated version]
   * @return {[Promise]}         [returns a promise that isn't used.]
   */
  var loopThroughRepos = function(dirList) {
    return Promise.map(dirList, (dirObj) => generateRepoLine(dirObj));
  };

  /**
   * Generates a single line, which pertains to the obj passed to it, and adds it to the global var line.
   * @param  {[Object]} dirObj [an object which contains the full path and the updated version of a repo]
   * @return {[{Promise}]}        [returns a promise that isn't used.]
   */
  var generateRepoLine = function(dirObj) {
    var dir = dirObj.dir,
        version = dirObj.version,
        lastSlash = __dirname.lastIndexOf("/"),
        repoName = dir.substr(lastSlash+1);

    line += `
${version}  ${repoName}
`;
  return Promise.resolve();
  };

  /**
   * creates the initial paragraph and report description and adds it to line.
   * @return {[Promise]} [returns a promise that isn't used.]
   */
  var createInitialLines = function(dirList) {
    var changedReposNumber = dirList.length;
    if (shared.dryRunn) {

      line += `This was a Dry Run(r), no files were sent to Github.
The following repositories were affected (${changedReposNumber}):

`;
    } else {
    line +=`This was a live run(n), and the following repositories were updated on Github:

`;
    }

    line +=`
Version       Repository

`;
  return Promise.resolve();
  };

  /**
   * creates the report file and write the contents of the line var into it.
   * @return {[Promise]} [returns a promise that isn't used.]
   */
  var writeToFile = function() {
    var currentDate = new Date(),
        dryOrLive =  (shared.dryRunn) ? '-dryRunn' : '-live',
        ReportName = currentDate.getFullYear() + "-" + currentDate.getMonth() + "-" + currentDate.getDay() + dryOrLive + '.txt',
        lastSlash = __dirname.lastIndexOf("/"),
        reportPath = __dirname.substr(0, lastSlash) + "/reports/" + ReportName;
      console.log("fullPath = " + reportPath);
    return fs.open(reportPath, "wx", (err, fd) => fs.writeFile(reportPath, line));
  };

  var main = function(dirList) {
    return createInitialLines(dirList)
    .then(() => loopThroughRepos(dirList))
    .then(() => writeToFile())
    .then(() => {
      console.log("A report has been generated for you @ " + reportPath);
      return Promise.resolve();
    });
  };

return {
  main: main
};
})();

module.exports = {
  main: generateReport.main
};
