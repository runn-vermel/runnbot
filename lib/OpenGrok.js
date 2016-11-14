var shared = require('./shared');
var resetRepos = require('./resetRepos');
const exec = require('child_process').exec;
var Promise = require('bluebird');
var colors = require('colors');
var ps = require('ps-node');


function indexRepos() {
  return exec('OPENGROK_INSTANCE_BASE=/runnbot/opengrok-0.12.1.6 /runnbot/opengrok-0.12.1.6/bin/OpenGrok index /runnbot/repos', (err, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
        console.log(colors.red(`stderr: ${stderr}`));
    if (err !== null) {
        console.log(colors.red(`exec error: ${err}`));
    }
    return Promise.resolve();
  });
}

var checkIfNodeIsRunning = function() {
  var psAsync = Promise.promisify(ps.lookup);

  return psAsync({pid: 40693})
  .then((results) => {
    console.log(results);
    debugger;
    return Promise.resolve();
  });
};

  var main = function() {
    return checkIfNodeIsRunning()
    .then(() => shared.getDirs())
    .then((dirList) => {
      console.log(colors.green('resetting repos'));
      return resetRepos.main(dirList);
    })
    .then(() => indexRepos());
  };

main();
