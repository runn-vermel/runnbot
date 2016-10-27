var shared = require('./shared');
var bump = require('./bump');
var cloneRepos = require('./cloneAllRepos');
var updateRepos = require('./updateRepos');
var release = require("./release");
const execSync = require('child_process').execSync;

//cloneRepos.main();

//updateRepos.main();

//add your code here

//TODO make bump return promise 
//bump
execSync(bump.main(shared.typeOfBump, 'this is my first test'));

//release
execSync(release.main());
