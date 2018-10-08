require("./locators");
import { mockRequests, mock } from "./mockserver-client-helpers";
const rootURL = `http://${process.env.APP_DOMAIN || 'localhost'}:${process.env.PORT || 3002}/`;

it('initialises the context', async () => {
  await browser.manage().window().setPosition(0, 0);
  await browser.manage().window().setSize(1280, 1024);
  await browser.get(rootURL);
});

it('should load the landing page', async () => {
  const el = await getElementByCss('[id="landing-page-graphic"]');
  expect(await el.getText()).toEqual("Manchester Makerspace");
});

describe("API Mocking", () => {
  it("Mocks sign in request", async () => {
    const memberId = "test_member"
    const memberPayload = {
      member: {
        id: "test_member",
        firstname: "Test",
        lastname: "Member",
        email: "test_member@test.com",
        role: ["member"]
      }
    }
    await mock(mockRequests.signIn.ok(memberPayload));
    await mock(mockRequests.member.get.ok(memberId, memberPayload));

    await browser.get(rootURL);
    await waitForPageChange()
    const url = await browser.getCurrentUrl();
    expect(url).not.toEqual(rootURL);    
  });
})