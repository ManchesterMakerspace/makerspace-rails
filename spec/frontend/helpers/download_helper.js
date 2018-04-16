var fs = require('fs');
var path = require('path');

var absoluteDownloadPath = path.resolve(__dirname, '../reporter/downloads');

exports.emptyDownloads = function(){
    return new Promise(function (resolve) {
        if(!fs.existsSync(absoluteDownloadPath)){
    		fs.mkdirSync(absoluteDownloadPath);
            resolve();
    	} else {
            var files = fs.readdirSync(absoluteDownloadPath);
            files.forEach(function(file){
                fs.unlink(path.join(absoluteDownloadPath, file), function(err){
                    if(err) {throw err;}
                });
            });
            resolve();
    	}
    });
};

exports.downloadPresent = function(filename){
    return new Promise(function(resolve){
        var files = fs.readdirSync(absoluteDownloadPath);
        var checkTerms = function(el, index, array) {
            var testName = el.split(".")[0];
            return (new RegExp(filename)).test(testName);
        }
        if(files.some(checkTerms)){
            resolve(true);
        } else {
            resolve(false);
        }
    });
};

exports.getDownloads = function () {
    return new Promise(function(resolve){
        var files = fs.readdirSync(absoluteDownloadPath);
        resolve(files);
    });
};
