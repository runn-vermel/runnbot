var shared = require('./shared');
var resetRepos = require('./resetRepos');
const exec = require('child_process').exec;
var Promise = require('bluebird');
var colors = require('colors');


function indexRepos() {
  return exec('OPENGROK_INSTANCE_BASE=opengrok-0.12.1.6 opengrok-0.12.1.6/bin/OpenGrok index /runnbot/repos', (err, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
        console.log(colors.red(`stderr: ${stderr}`));
    if (err !== null) {
        console.log(colors.red(`exec error: ${err}`));
    }
    return Promise.resolve();
  });
}

  var main = function() {
    return shared.getDirs()
    .then((dirList) => {
      console.log(colors.green('resetting repos'));
      return resetRepos.main(dirList);
    })
    .then(() => indexRepos());
  };

main();
