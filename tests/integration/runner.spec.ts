/* Since these tests all rely on the same mockserver instance,
*  they should be run one at a time so as to not interfere with the mocked request
*  This file composes all of the suites into a running list starting with base.
*  The base file is responsible for setting up the initial browser env so it must come first
*/
(function (){
  const fs = require('fs');
  const path = require('path');

  const suitesPath = path.resolve(__dirname, "suites");
  const suites = fs.readdirSync(suitesPath);
  const baseSpec = "base.spec.ts";

  const constructSuitePath = (testName: string) => `./suites/${testName}`;
  require(constructSuitePath(baseSpec));
  suites.map((suite: any) => {
    if (suite === baseSpec) { return; }
    require(constructSuitePath(suite));
  });
})();