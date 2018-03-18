var fs = require('fs');
var path = require('path');

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
        var data = fs.readFileSync(mailDir + '/' + filename + ".txt", 'utf-8');
        resolve(data);
    });
};

exports.emailPresent = function(filename){
    return new Promise(function(resolve){
        var files = fs.readdirSync(mailDir);
        if(files.includes(filename + '.txt')){
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
          return file.indexOf(".txt") !== -1;
        });
        resolve(files.length);
    });
};
