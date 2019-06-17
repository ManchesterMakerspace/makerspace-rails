const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const mailDir = path.resolve(__dirname, '../../tmp/mail');


const getMail = () => {
  return fs.readdirSync(mailDir);
}
const buildFileName = (emailAddress) => `${mailDir}/${emailAddress}`;

export const emptyMail = () => {
  if (!fs.existsSync(mailDir)) {
    fs.mkdirSync(mailDir);
    return;
  } else {
  const files = getMail();
    files.forEach((file: string) => {
      fs.unlink(path.join(mailDir, file), (err: Error) => {
        if (err) { throw err; }
      });
    });
    return;
  }
}

export const readMail = (emailAddress: string) => {
  return fs.readFileSync(buildFileName(emailAddress), 'utf-8');
}

export const extractLinkFromEmail = (emailAddress: string) => {
  const data = readMail(emailAddress);
  const $ = cheerio.load(data);
  const link = $('a[href^="http://"]');
  return $(link).attr('href');
}

export const emailPresent = (emailAddress: string) => {
  const files = getMail();
  return Array.isArray(files) && files.includes(emailAddress);
}

export const emailCount = () => {
  const files = [getMail() || []].filter((file: any) => file.isFile());
  return files.length;
}

export const openEmail = (emailAddress: string) => {
  return browser.get(buildFileName(emailAddress));
}