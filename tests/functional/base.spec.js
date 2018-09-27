require("./locators");

const mockserver = require('mockserver-client').mockServerClient("localhost", 1080);
const rootURL = 'http://www.localhost:3002/';

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
    await mockserver.mockAnyResponse({
        "httpRequest": {
          "method": "POST",
          "path": "/api/members/sign_in.json",
        },
        "httpResponse": {
          "body": JSON.stringify({
            member: {
              id: "test_member",
              firstname: "Test",
              lastname: "Member",
              email: "test_member@test.com",
              role: ["member"]
            }
          })
        }
      })
    await mockserver.mockAnyResponse({
      "httpRequest": {
        "method": "GET",
        "path": "/api/members/test_member.json",
      },
      "httpResponse": {
        "body": JSON.stringify({
          member: {
            id: "test_member",
            firstname: "Test",
            lastname: "Member",
            email: "test_member@test.com",
            role: ["member"]
          }
        })
      }
    })
    await browser.get(rootURL);
    waitForPageChange()
    const url = await browser.getCurrentUrl();
    expect(url).not.toEqual(rootURL);    
  });
})