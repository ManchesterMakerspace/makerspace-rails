/**
 * 1. Tag and commit React package
 * 3. Tag and commit gem
 * 3. Package and publish gem
 */

const { tagRepo } = require("./simple_tag");
const packageGem = require("./release_gem");
const reactRepo = "makerspace-react";
const gemRepo = "makerspace-react-rails";


const main = async () => {
  const nextTag = await tagRepo(reactRepo);
  if (nextTag) {
    try {
      await tagRepo(gemRepo, nextTag);
    } catch (e) { // Catch gem tag error but dont block publish
      console.log(`Error tagging ${gemRepo}`, e);
    }
    await packageGem(nextTag);
  }
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
