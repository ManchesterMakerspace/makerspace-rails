import { reset as resetMockserver } from "../mockserver-client-helpers";
import { PageUtils, rootURL } from "../pageObjects/common";

const utils = new PageUtils();

// Set locating timeout to 10s
utils.setLocatorTimeout(10000);
// Set Jest timeout to 2m
// Since this is for functional testing, these tests may take several minutes to complete
// Make sure enough time is allowed so that test can complete
// Locator timeout (10s) should fail these tests before this timeout is reached
jest.setTimeout(120000);

beforeEach(async () => {
  return resetMockserver().then(() => {
    return browser.get(rootURL);
  });
});

// Initialize browser context
it('initialises the context', async () => {
  await browser.manage().window().setPosition(0, 0);
  await browser.manage().window().setSize(1280, 1024);
  await browser.get(rootURL);
});

// Smoke test that app is running
it('should load the landing page', async () => {
  const el = await utils.getElementByCss('[id="landing-page-graphic"]');
  expect(await el.getText()).toEqual("Manchester Makerspace");
});
