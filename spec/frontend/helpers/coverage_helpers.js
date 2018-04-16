var http = require('http');

exports.loadCoverage = function () {

  return browser.executeScript('return window.__coverage__;').then(function (result) {
    console.log(result);
    var str = JSON.stringify(result);
    var options = {
      port: 6969,
      host: 'localhost',
      path: '/coverage/client',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    let req = http.request(options, res => {

      let data = '';
      // you *must* listen to data event
      // so that the end event will fire...
      res.on('data', d => {
        data += d;
      });

      res.once('end', function () {
       // Finished sending coverage data
      });
    });
    req.write(str);
    req.end();
  });
};
