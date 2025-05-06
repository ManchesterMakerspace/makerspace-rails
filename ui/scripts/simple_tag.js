const simpleGit = require("simple-git/promise");
const path = require("path");
const fs = require("fs");
const os = require("os");
const remote = (repo) => `https://${process.env.USERNAME}:${process.env.PASSPHRASE}@github.com/ManchesterMakerspace/${repo}.git`
const tmp = path.join(process.cwd(), "tmp");

const patchRegex = /#(patch)\b/m;
const minorRegex = /#(minor)\b/m;
const majorRegex = /#(major)\b/m;

module.exports.tagRepo = async (repo, forceTag) => {
  console.log(`Bumping ${repo}`);
  let git = simpleGit();
  let nextTag = forceTag;

  if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp);
  }

  let repoRemote = remote(repo);
  const repoPath = path.join(process.cwd(), "tmp", repo);

  if (!fs.existsSync(repoPath)) {
    await git.clone(repoRemote, repoPath);
  }
  git = simpleGit(repoPath);
  await git.silent(true); // Silence any errors to prevent logging of credentials

  if (!nextTag) {
    console.log(`Evaluating next tag for ${repo}`);
    const { latest: lastTag } = await git.tags();

    if (!lastTag) {
      console.log(`No tags for repo ${repo}. Setting initial tag 0.0.0`);
      await git.tag(["0.0.0"]);
      await git.pushTags();
      return;
    }
  
    const { latest: { hash, message } } = await git.log();
    const commitTags = await git.tag(["--points-at", hash]);
  
    if (commitTags) {
      const commitTagsList = commitTags.split(os.EOL).filter(t => !!t);
      if (commitTagsList.length > 1) {
        console.log(`Commit has too many tags to parse: ${commitTagsList.join(", ")}. Exiting.`);
        process.exit(0);
      }
      console.log(`Commit already tagged with ${commitTagsList[0]}. Skipping tagging..`);
      return commitTagsList[0];
    }
  
    console.log(lastTag)
    const [major, minor, patch] = lastTag.split(".");
    if (majorRegex.exec(message)) {
      nextTag = `${Number(major)+1}.0.0`;
    } else if (minorRegex.exec(message)) {
      nextTag = `${major}.${Number(minor)+1}.0`;
    } else if (patchRegex.exec(message)) {
      nextTag = `${major}.${minor}.${Number(patch)+1}`;
    }
  }

  if (!nextTag) {
    console.log("No tagging for this commit");
    return;
  }

  console.log(`Tagging repo: ${nextTag}`)
  await git.tag([nextTag]);
  console.log("Pushing new tag");
  await git.pushTags();
  console.log("Tagging complete");
  return nextTag;
}