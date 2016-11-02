var shared = require('./shared');
var cloneRepos = require('./cloneAllRepos');
var resetRepos = require('./resetRepos');
var bump = require('./bump');
var release = require("./release");
var requiredParamChecker = require('./requiredParamChecker');
var createChangedRepoList = require('./createChangedRepoList');
var prepareRepoList = require("./prepareRepoList");
var Promise = require("bluebird");
var generateReport = require('./generateReport');

//call the parameter check first
var runnTask = requiredParamChecker.main()
//prepare our repo list
.then(() => {
 if (!shared.initialRunn) {
   console.log("Preparing The repository list...");
   return prepareRepoList.main() ;
 } else {
   return Promise.resolve();
 }
})
//check if this is an initial run, and if so, clone all repos. if not, reset the repos
.then((dirList) => {
  if (shared.initialRunn) {
    return cloneRepos.main();
  } else {
    console.log("Resetting repositories...");
    return resetRepos.main(dirList);
  }
})

//promisifying the developer supplied module, and loop it through the dir List.
//To ensure that they rememebered to put a dummy callback in their module, we timeout in 1 minute. this will only hit if the
//module is not done in 1 minute - which should be long enough for most thing to run.
.then((dirList) => {
  this.dirList = dirList;
  var lastSlash = __dirname.lastIndexOf("/"),
      developerRequire = __dirname.substr(0, lastSlash) + "/modules/" + shared.developerModule + ".js",
      developerModule = require(developerRequire),
      developerModuleAsync = Promise.promisify(developerModule.main),
      timeoutErr = 'Too long has passed - did you remember to return either a callback or a promise from your module?';
  console.log("Running your module...");
  return Promise
         .all(dirList.map((dir) => developerModuleAsync(dir)))
         .timeout(60000)
         .catch(Promise.TimeoutError, () => Promise.reject(new Error(timeoutErr)));

})
//create the list of changed repos. we DO NOT use the promise returned from the developer module, but the dirList we established
//earlier on.
.then(() => {
  console.log("Creating a Changed Repository List...");
  return createChangedRepoList.main(this.dirList);
})
//take the changed repo list, and pass it to bump to bump the version numbers
.then((dirList) => {
  console.log("Bumping all the changed repositories...");
  return bump.main(dirList);
})
//check whether we're doing a dry run - which is on by default. if we are, we're done, and we resolve.
//If it's not a dry run, run release.
.then((dirList) => {
  console.log('release ' + dirList);
  if (shared.dryRunn) {
    console.log('Since this was a dry run(n), Runnbot is done - your changes were not pushed to Github. To push this live, add the --dryRunn="false" flag');
    return Promise.resolve(dirList);
  } else {
    console.log("Pushing your changes to Github...");
    return release.main(dirList);
  }
})
.then((dirList) => {
console.log('report' + dirList);
  generateReport.main(dirList);
})
.error(console.log)
.catch(console.log)
.done();
