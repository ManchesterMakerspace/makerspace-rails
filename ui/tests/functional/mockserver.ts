import { MockMakerspaceApi, defaultMatchFunctions } from "makerspace-ts-mock-client";

export function loadMockserver() {
    return new MockMakerspaceApi(
        browser.config.baseUrl + "/api", 
        browser, 
        { matchCriteria: { body: defaultMatchFunctions.jsonBodyIsMatch } }
    );
}