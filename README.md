## RunnBot

### What this script does
this bot is intended to cut down on time maintaining and updating a large number of repositories.

It does this by looping through the specified repos (all|requested|excluded), resetting them, running a user supplied script, doing a bump (patch|minor|major), updating the bower/package/HISTORY files, and finally, doing a git commit and tag, and pushing the commits and tags back up to github.


### Expectations

  a. This module should accept the repo's location on the drive as a string (for example, "/users/joe/repos/somerepo") as its only parameter.
  b. This module should be built as either a standard node module, or a promise. this means it should either have a callback (which should NOT actually call anything back), or return a promise. The supplied module is promisified in the background, which is why this structure is required.
  c. You should expect the code in this module to be looped through the specified repos.

### How to use this
1. Clone this repo.
2. Write your own module. Please read the Expectation section to ensure your module works with Runnbot. Save your module into the modules folder.

2. Go into the lib folder and run this in your terminal. this is the minimum required:
```
node main.js --username="GITHUB_USERNAME" --password="GITHUB_PASSWORD" --bump="patch|minor|major" --message="your commit ands history message" --developerModule="MyModule"
```
if this is the first time you're running this script, using the flag --initial="true" will grab all the repos in the specified team/org (the team/org defaults to "Px/PredixDev").
3. Sit back and enjoy an IPA.

### Please Note

1. **Do NOT use runnbot on your every working directories.**
 Part of the process is to reset ALL the repos before your module is run - which means you WILL lose any saved work in any of the repos.
2. 
