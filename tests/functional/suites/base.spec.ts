import { reset as resetMockserver } from "../mockserver-client-helpers";
import utils, { rootURL } from "../../pageObjects/common";

// Set locating timeout to 10s
utils.setLocatorTimeout(10000);
// Set Jest timeout to 3m
// Since this is for functional testing, these tests may take several minutes to complete
// Make sure enough time is allowed so that test can complete
// Locator timeout (10s) should fail these tests before this timeout is reached
jest.setTimeout(180000);

beforeEach(async () => {
  return resetMockserver();
});

// Initialize browser context
it('initialises the context', async () => {
  await browser.manage().window().setPosition(0, 0);
  await browser.manage().window().setSize(1280, 1024);
  await browser.get(rootURL);
});

// Smoke test that app is running
it('should load the landing page', async () => {
  await browser.get(rootURL);
  expect(await utils.isElementDisplayed('[id="landing-page-graphic"]')).toBeTruthy();
});

afterAll(function (done) {
  process.nextTick(done);
});