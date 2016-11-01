var shared = require('./shared');
var cloneRepos = require('./cloneAllRepos');
var resetRepos = require('./resetRepos');
var bump = require('./bump');
var release = require("./release");
var requiredParamChecker = require('./requiredParamChecker');
var createChangedRepoList = require('./createChangedRepoList');
var prepareRepoList = require("./prepareRepoList");
var Promise = require("bluebird");

//call the parameter check first
var runnTask = requiredParamChecker.main()
//prepare our repo list
.then(prepareRepoList.main)
//check if this is an initial run, and if so, clone all repos. if not, reset the repos
.then((dirList) => (shared.initialRunn) ?  cloneRepos.main() :  resetRepos.main(dirList))
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

  return Promise
         .all(dirList.map((dir) => developerModuleAsync(dir)))
         .timeout(60000)
         .catch(Promise.TimeoutError, () => Promise.reject(new Error(timeoutErr)));

})
//create the list of changed repos. we DO NOT use the promise returned from the developer module, but the dirList we established
//earlier on.
.then(() => createChangedRepoList.main(this.dirList))
//take the changed repo list, and pass it to bump to bump the version numbers
.then(() => bump.main)
//check whether we're doing a dry run - whic is on by default. if we are, we're done, and we resolve.
//If it's not a dry run, run release.
.then(() => (shared.dryRunn) ? Promise.resolve() : release.main())
.error(console.log)
.catch(console.log)
.done();
