var shared = require('./shared');
var cloneRepos = require('./cloneAllRepos');
var resetRepos = require('./resetRepos');
var bump = require('./bump');
var release = require("./release");
var requiredParamChecker = require('./requiredParamChecker');
var createChangedRepoList = require('./createChangedRepoList');
var prepareRepoList = require("./prepareRepoList");
var Promise = require("bluebird");

//add your code here
var runnTask = requiredParamChecker
.main()
.then(prepareRepoList.main)
.then((dirList) => (shared.initialRunn) ?  cloneRepos.main() :  resetRepos.main(dirList))
.then((dirList) => {
  this.dirList = dirList;
  var lastSlash = __dirname.lastIndexOf("/"),
      developerRequire = __dirname.substr(0, lastSlash) + "/modules/" + shared.developerModule + ".js",
      developerModule = require(developerRequire),
      developerModuleAsync = Promise.promisify(developerModule.main),
      timeoutErr = 'Too long has passed - did you remember to return either a callback or a promise from your module?';

  return Promise
         .all(dirList.map((dir) => developerModuleAsync(dir)))
         .timeout(50000)
         .catch(Promise.TimeoutError, () => Promise.reject(new Error(timeoutErr)));

})
.then(() => createChangedRepoList.main(this.dirList))
.then((dirList) => bump.main(dirList))
.then(() => (shared.dryRunn) ? Promise.resolve() : release.main())
.error(console.log)
.catch(console.log)
.done();
