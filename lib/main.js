var shared = require('./shared');
var cloneRepos = require('./cloneAllRepos');
var resetRepos = require('./resetRepos');
var bump = require('./bump');
var release = require("./release");
var requiredParamChecker = require('./requiredParamChecker');
var createChangedRepoList = require('./createChangedRepoList');
var requestedRepos = require("./requestedRepos");
var Promise = require("bluebird");

//add your code here
var runnTask = requiredParamChecker.main()
.then(requestedRepos.main)
.then((dirList) => (shared.initial) ?  cloneRepos.main() :  resetRepos.main(dirList))
.then((dirList) => {
  this.dirList = dirList;
  debugger;
  var lastSlash = __dirname.lastIndexOf("/");
  var developerRequire = __dirname.substr(0, lastSlash) + "/modules/" + shared.developerModule + ".js";

  var developerModule = require(developerRequire);
  var developerModuleAsync = Promise.promisify(developerModule.main);
  var timeoutErr = 'Too long has passed - did you remember to return either a callback or a promise from your module?';

  return Promise
         .all(dirList.map((dir) => developerModuleAsync(dir)))
         .timeout(50000)
         .catch(Promise.TimeoutError, () => Promise.reject(new Error(timeoutErr)));

})
.then(() => createChangedRepoList.main(this.dirList))
.then((dirList) => {
  debugger
  bump.main(dirList);
})
// .then(() => {
//   if (shared.dry) return Promise.resolve();
//   return release.main();
// })

.error(console.log)
.catch(console.log)
.done();
