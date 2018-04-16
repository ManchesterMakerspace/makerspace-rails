var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var mailDir = path.resolve(__dirname, '../../../tmp/mail');

exports.emptyMail = function(){
    return new Promise(function (resolve) {
      if(!fs.existsSync(mailDir)){
    		fs.mkdirSync(mailDir);
            resolve();
    	} else {
            var files = fs.readdirSync(mailDir);
            files.forEach(function(file){
                fs.unlink(path.join(mailDir, file), function(err){
                    if(err) {throw err;}
                });
            });
            resolve();
    	}
    });
};

exports.readMail = function(filename){
    return new Promise(function(resolve){
        var data = fs.readFileSync(mailDir + '/' + filename, 'utf-8');
        resolve(data);
    });
};

exports.extractRegisterLink = function (filename) {
  return new Promise(function(resolve){
      var data = fs.readFileSync(mailDir + '/' + filename, 'utf-8');
      var $ = cheerio.load(data);
      var link = $('#register-link');
      var url = $(link).attr('href');
      resolve(url);
  });
};

exports.emailPresent = function(filename){
    return new Promise(function(resolve){
        var files = fs.readdirSync(mailDir);
        if(files.includes(filename)){
            resolve(true);
        } else {
            resolve(false);
        }
    });
};

exports.emailCount = function(){
    return new Promise(function(resolve){
        var files = fs.readdirSync(mailDir);
        files = files.filter(function (file) {
          return file.isFile();
        });
        resolve(files.length);
    });
};
