const fs = require("fs");
const path = require('path');
const { google } = require('googleapis');
const envFile = path.resolve(__dirname, "../test.env");

const screenshotFolder = path.resolve(__dirname, "../tmp/screenshots");
require('dotenv').config({ path: envFile });


const getScreenshotPath = (filename => path.resolve(__dirname, "../tmp/screenshots", filename));
const main = () => {

  return new Promise((resolve, reject) => {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_ID,
      process.env.GOOGLE_SECRET,
    );
  
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_TOKEN
    });
  
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    });
  
    fs.readdir(screenshotFolder, async (err, files) => {
      if (err) {
        reject(err);
      }

      await Promise.all(files.map(async (file) => {
        return drive.files.create({
          requestBody: {
            name: file,
            mimeType: 'image/png',
            parents: ["1im4l-Ub3qEOd-ZPwBQTx7_KUkObNSPPw"]
          },
          media: {
            mimeType: 'image/png',
            body: fs.createReadStream(getScreenshotPath(file))
          }
        });
      }));

      resolve();
    });
  });
}

main().catch(console.error);
