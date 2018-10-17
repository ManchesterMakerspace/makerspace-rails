const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const screenshotDir = path.resolve(__dirname, '../../tmp/screenshots');

class ScreenshotReporter {
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

  async specDone(result) {
    if (result.status === 'failed') {
        const screenshot = await this.browser.takeScreenshot();
        const filename = path.format({ dir: screenshotDir, name: result.fullName, ext: '.png' });
        mkdirp.sync(screenshotDir);
        fs.writeFileSync(filename, screenshot, 'base64');
    }
  }
}

module.exports = ScreenshotReporter;