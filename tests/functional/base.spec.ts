import { mockRequests, mock, reset as resetMockserver } from "./mockserver-client-helpers";
import { AuthPageObject } from "./pageObjects/auth";
import { PageUtils } from "./pageObjects/common";
import { Routing } from "app/constants";
import { MemberRole } from "app/entities/member";
const rootURL = `http://${process.env.APP_DOMAIN || 'localhost'}:${process.env.PORT || 3002}`;
const auth = new AuthPageObject();
const utils = new PageUtils();

// Set locating timeout to 10s
utils.setLocatorTimeout(10000);
// Set Jest timeout to 2m
// Since this is for functional testing, these tests may take several minutes to complete
// Make sure enough time is allowed so that test can complete
// Locator timeout should fail these tests before this timeout is reached
// if tests are setup correctly
jest.setTimeout(120000);

beforeEach(async () => {
  return resetMockserver().then(() => {
    return browser.get(rootURL);
  });
});

it('initialises the context', async () => {
  await browser.manage().window().setPosition(0, 0);
  await browser.manage().window().setSize(1280, 1024);
  await browser.get(rootURL);
});

it('should load the landing page', async () => {
  const el = await utils.getElementByCss('[id="landing-page-graphic"]');
  expect(await el.getText()).toEqual("Manchester Makerspace");
});

describe("API Mocking", () => {
  it("Mocks sign in request", async () => {
    const memberId = "test_member"
    const member = {
      id: "test_member",
      firstname: "Test",
      lastname: "Member",
      email: "test_member@test.com",
      role: [MemberRole.Member]
    }
    await mock(mockRequests.signIn.ok({
      ...member,
      password: "password"
    }));
    await mock(mockRequests.member.get.ok(memberId, member));
    await auth.goToLogin();
    await auth.signInUser({
      email: member.email,
      password: "password"
    });
    await utils.waitForPageChange(`${rootURL}${Routing.Login}`);
    const url = await browser.getCurrentUrl();
    expect(url).not.toEqual(`${rootURL}${Routing.Login}`);
  });
})