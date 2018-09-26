const mockServerClient = require('mockserver-client').mockServerClient;

const rootURL = 'http://www.localhost:3002/'
const waitUntilTime = 20000
let driver;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

async function getElementById(id) {
  const el = await browser.wait(until.elementLocated(by.id(id)), waitUntilTime)
  return await browser.wait(until.elementIsVisible(el), waitUntilTime)
}

async function getElementByCss(css) {
  const el = await browser.wait(until.elementLocated(by.css(css)), waitUntilTime)
  return await browser.wait(until.elementIsVisible(el), waitUntilTime)
}

it('initialises the context', async () => {
  await browser.get(rootURL)
})

it('should load the landing page', async () => {
  const el = await getElementByCss('[id="landing-page-graphic"]');
  expect(await el.getText()).toEqual("Manchester Makerspace");
})

let mockserver;
describe("API Mocking", () => {
  beforeEach(() => {
    mockserver = mockServerClient("localhost", 1080)
  });

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
    const el = await getElementByCss('[id="landing-page-graphic"]');
    browser.wait(() => {
      return el.isDisplayed().then((d) => !d);
    });
  });
})