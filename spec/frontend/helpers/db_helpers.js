exports.resetDB = function(){
    var exec = require('child_process').exec;
    return new Promise(function(resolve, reject){
        console.log('Resetting database...');
        exec('RAILS_ENV=test rake db:db_reset', {maxBuffer: 1024 * 50000}, function(err, stdout, stderr){
            if(err) {throw err; }
            console.log('done');
            resolve('done');
        });
    });
};

exports.addRejectionCard = function (number) {
  var cp = require('child_process');
  return new Promise(function(resolve, reject){
      cp.execSync('RAILS_ENV=test rake db:reject_card[' + number + ']', {maxBuffer: 1024 * 50000}, function(err, stdout, stderr){
          if(err) {throw err; }
          console.log('created');
          resolve('done');
      });
  });
};
