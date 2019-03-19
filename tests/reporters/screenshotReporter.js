const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const screenshotDir = path.resolve(__dirname, '../../tmp/screenshots');

export class ScreenshotReporter {
  constructor({ browser }) {
    this.browser = browser;
    this.cleanScreenshots();
  }
  cleanScreenshots() {
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir)
    } else {
      const files = fs.readdirSync(screenshotDir);
      files.forEach((file) => fs.unlinkSync(path.join(screenshotDir, file)));
    }
  }

  specDone(result) {
    return new Promise( async (resolve) => {
      if (result.status === 'failed') {
        try {
          const screenshot = await this.browser.takeScreenshot();

          const screenshotFilename = path.format({ dir: screenshotDir, name: result.fullName, ext: '.png' });

          mkdirp.sync(screenshotDir);
          fs.writeFileSync(screenshotFilename, screenshot, 'base64');
          console.log("saved screenshot");
        } catch (e) {
          console.log("Error saving screenshot", e);
        } finally {
          return resolve;
        }
      }
    });
  }
}

module.exports = ScreenshotReporter;