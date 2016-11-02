var shared = require('./shared'),
    Promise = require("bluebird"),
    fs = Promise.promisifyAll(require('fs-extra'));


var generateReport = (function() {
  line= '';

  var loopThroughRepos = function(dirList) {
    return Promise.map(dirList, (dirObj) => generateRepoLine(dirObj));
  };

  var generateRepoLine = function(dirObj) {
    var dir = dirObj.dir,
        version = dirObj.version,
        lastSlash = __dirname.lastIndexOf("/"),
        repoName = dir.substr(lastSlash+1);

    line += `
${repoName}           ${version}
`;
  return Promise.resolve();
  };

  var createInitialLines = function() {
    if (shared.dryRunn) {
      line += `This was a Dry Run(r), no files were sent to Github.
The following repositories were affected:

`;
    } else {
    line +=`This was a live run(n), and the following repositories were updated on Github:

`;
    }

    line +=`
Repository             Version

`;
  return Promise.resolve();
  };
  var writeToFile = function() {
    var currentDate = new Date(),
        dryOrLive =  (shared.dryRunn) ? '-dryRunn' : '-live',
        ReportName = currentDate.getFullYear() + "-" + currentDate.getMonth() + "-" + currentDate.getDay() + dryOrLive + '.txt',
        lastSlash = __dirname.lastIndexOf("/"),
        fullPath = __dirname.substr(0, lastSlash) + "/reports/" + ReportName;
      console.log("fullPath = " + fullPath);
    return fs.open(fullPath, "wx", (err, fd) => fs.writeFile(fullPath, line));
  };

  var main = function(dirList) {
    return createInitialLines()
    .then(() => loopThroughRepos(dirList))
    .then(() => writeToFile())
    .then(() => Promise.resolve());
  };

return {
  main: main
};
})();

module.exports = {
  main: generateReport.main
};
