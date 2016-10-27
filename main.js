var shared = require('./shared');
var bump = require('./bump');
var cloneRepos = require('./cloneAllRepos');
var updateRepos = require('./updateRepos');
var release = require("./release");
var Promise = require("bluebird");

//cloneRepos.main();

updateRepos.main();

//add your code here

//TODO make bump return promise
//bump
// var dirs = bump.main(shared.typeOfBump);
// dirs.then(function(dirs) {
//   release.main(dirs);
// })
// .done();
