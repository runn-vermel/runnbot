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
var colors = require('colors');

//call the parameter check first
var runnTask = requiredParamChecker.main()
//prepare our repo list
.then(() => {
 if (!shared.initialRunn) {
   console.log(colors.green("Preparing The repository list..."));
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
    console.log(colors.green("Resetting repositories..."));
    return resetRepos.main(dirList);
  }
})

//promisifying the developer supplied module, and loop it through the dir List.
//To ensure that they rememebered to put a dummy callback in their module, we timeout in 1 minute. this will only hit if the
//module is not done in 1 minute - which should be long enough for most thing to run.
.then((dirList) => {
  if (!shared.initialRunn) {
    this.dirList = dirList;
    var lastSlash = __dirname.lastIndexOf("/"),
        developerRequire = __dirname.substr(0, lastSlash) + "/modules/" + shared.developerModule + ".js",
        developerModule = require(developerRequire),
        developerModuleAsync = Promise.promisify(developerModule.main),
        timeoutErr = 'Too long has passed - did you remember to return either a callback or a promise from your module?';

    console.log(colors.green("Running Supplied Module..."));

    return Promise
           .map(dirList, (dir) => developerModuleAsync(dir), {concurrency: shared.concurrency})
           .timeout(120000)
           .catch(Promise.TimeoutError, () => Promise.reject(colors.red(timeoutErr)));
  } else {
    return Promise.resolve();
  }
})
//create the list of changed repos. we DO NOT use the promise returned from the developer module, but the dirList we established
//earlier on.
.then(() => {
  if (!shared.initialRunn) {
    console.log(colors.green("Creating a Changed Repository List..."));
    return createChangedRepoList.main(this.dirList);
  } else {
    return Promise.resolve();
  }
})
//take the changed repo list, and pass it to bump to bump the version numbers
.then((dirList) => {
  if (!shared.initialRunn) {
    console.log('shared.noTag = ' + shared.noTag);
    if (shared.noTag || shared.dryRunn) {
      console.log(colors.green("skipping Tagging..."));
      return Promise.resolve(dirList);
    } else {
      console.log(colors.green("Bumping all the changed repositories..."));
      return bump.main(dirList);
    }
  } else {
    return Promise.resolve();
  }
})
//check whether we're doing a dry run - which is on by default. if we are, we're done, and we resolve.
//If it's not a dry run, run release.
.then((dirList) => {
  if (!shared.initialRunn) {
    if (shared.dryRunn) {
      console.log(colors.green('Since this was a dry run(n), Runnbot is done - your changes were not pushed to Github. To push this live, add the --dryRunn="false" flag'));
      return Promise.resolve(dirList);
    } else {
      console.log(colors.green("Pushing your changes to Github..."));
      if (dirList && dirList.length) {
        return release.main(dirList);
      } else {
        console.log(colors.red("Nothing was pushed, since no repository had any changes in it."));
        return Promise.resolve(dirList);
      }
    }
  } else {
    return Promise.resolve();
  }
})
.then((dirList) => {
  if (!shared.initialRunn) {
    if (dirList && dirList.length) {
        generateReport.main(dirList);
    } else {
      console.log(colors.yellow("Nothing was changed, not pushing anything, no report was generated."));
      return Promise.resolve();
    }
  } else {
    return Promise.resolve();
  }
})
.error(colors.red(console.log))
.catch(colors.red(console.log))
.done();
