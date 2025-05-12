import { CreditCard } from "makerspace-ts-api-client";
import { Mockserver } from "makerspace-ts-mock-client";

const objectAsBase64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64");

let mockserver: Mockserver;

export const loadBraintreeMockserver = () => {
  mockserver = new Mockserver(btBasePath, browser, { failNoMock: false });
  return mockserver;
}
const btBasePath = "https://payments.sandbox.braintree-api.com";
export const mockBraintreeTokenValidation = (creditCard: CreditCard) => {
  mockserver.mockRequest({
    path: `${btBasePath}/graphql`,
    method: "POST",
    response: {
      data: {
        "data": {
          "tokenizeCreditCard": {
            "token": creditCard.id,
            "creditCard": {
              ...creditCard,
              last4: creditCard.last4.toString(),
              "bin": "411111",
              "brandCode": creditCard.cardType.toUpperCase(),
              "binData": {
                "prepaid": "UNKNOWN",
                "healthcare": "UNKNOWN",
                "debit": "UNKNOWN",
                "durbinRegulated": "UNKNOWN",
                "commercial": "UNKNOWN",
                "payroll": "UNKNOWN",
                "issuingBank": null,
                "countryOfIssuance": null,
                "productId": null
              }
            }
          }
        },
        "extensions": {
          "requestId": "e0899195-1d58-48b0-a25a-3d48247a98d1"
        }
      },
      response: {
        status: 200,
        statusText: "OK",
        ok: true,
      }
    },
    times: 1
  })
  mockserver.mockRequest({
    path: `${btBasePath}/graphql`,
    method: "POST",
    response: {
      data: {
        "data": {
          "clientConfiguration": {
            "analyticsUrl": "https://origin-analytics-sand.sandbox.braintree-api.com/j9f4k8pnshzfzsxv",
            "environment": "SANDBOX",
            "merchantId": "j9f4k8pnshzfzsxv",
            "assetsUrl": "https://assets.braintreegateway.com",
            "clientApiUrl": "https://api.sandbox.braintreegateway.com:443/merchants/j9f4k8pnshzfzsxv/client_api",
            "creditCard": {
              "supportedCardBrands": [
                "MASTERCARD",
                "VISA",
                "AMERICAN_EXPRESS",
                "DISCOVER",
                "JCB",
                "UNION_PAY"
              ],
              "challenges": [],
              "threeDSecureEnabled": true,
              "threeDSecure": {
                "cardinalAuthenticationJWT": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlYjkzYTUwYS01NDM3LTRkY2EtOWY4Ni03ZDFkZWU1ODEwZmEiLCJpYXQiOjE2NTI4ODQwNTQsImV4cCI6MTY1Mjg5MTI1NCwiaXNzIjoiNWM1MzZmZTI2ZmUzZDExMWMwNThlNjk4IiwiT3JnVW5pdElkIjoiNTVlZjNmN2NmNzIzYWE0MzFjOTllMTgwIn0.clMHBPrZIin1MZZB2nokpeRwWeoNGwNGC4QoYal4_LA"
              }
            },
            "applePayWeb": null,
            "googlePay": null,
            "ideal": null,
            "kount": {
              "merchantId": null
            },
            "masterpass": null,
            "paypal": {
              "displayName": "Manchester Makerspace",
              "clientId": "AbqBGx5--vixOvzDklGcTGLbVlkt-jdcgbZePh7Yxs0eiZdIDeuoLha-i252CG8MTX7PHLAgTL1OxPUa",
              "privacyUrl": "http://example.com/pp",
              "userAgreementUrl": "http://example.com/tos",
              "assetsUrl": "https://checkout.paypal.com",
              "environment": "OFFLINE",
              "environmentNoNetwork": false,
              "unvettedMerchant": false,
              "braintreeClientId": "masterclient3",
              "billingAgreementsEnabled": true,
              "merchantAccountId": "manchestermakerspace",
              "currencyCode": "USD",
              "payeeEmail": null
            },
            "unionPay": null,
            "usBankAccount": null,
            "venmo": null,
            "visaCheckout": null,
            "braintreeApi": null,
            "supportedFeatures": [
              "TOKENIZE_CREDIT_CARDS"
            ]
          }
        },
        "extensions": {
          "requestId": "b0cee4cd-c03a-450d-ae6c-340348ffa574"
        }
      },
      response: {
        status: 200,
        statusText: "OK",
        ok: true,
      }
    },
    times: 1
  })
}

export const generateClientToken = () => objectAsBase64({
  "version": 2,
  "authorizationFingerprint": `${objectAsBase64({
    "typ": "JWT",
    "alg": "ES256",
    "kid": "2018042616-sandbox",
    "iss": "https://api.sandbox.braintreegateway.com"
  })}.${objectAsBase64({
    "exp": Number(new Date()) + 86400,
    "jti": "81a9b62c-1dbf-40a2-af59-36dd91fb0f00",
    "sub": "j9f4k8pnshzfzsxv",
    "iss": "https://api.sandbox.braintreegateway.com",
    "merchant": {
      "public_id": "j9f4k8pnshzfzsxv",
      "verify_card_by_default": true
    },
    "rights": ["manage_vault"],
    "scope": ["Braintree:Vault"],
    "options": {}
  })}.fQGwGHdavJMAdtVNpQ-ujSHcIivMGGc52qI-hiTksqbq6bhXbp2b1fZ3EIKB8NQCqmu3I1bSnhoRWPeq4Y4hIQ`,
  "configUrl": "https://api.sandbox.braintreegateway.com:443/merchants/j9f4k8pnshzfzsxv/client_api/v1/configuration",
  "graphQL": {
    "url": "https://payments.sandbox.braintree-api.com/graphql",
    "date": "2018-05-08",
    "features": ["tokenize_credit_cards"]
  },
  "clientApiUrl": "https://api.sandbox.braintreegateway.com:443/merchants/j9f4k8pnshzfzsxv/client_api",
  "environment": "sandbox",
  "merchantId": "j9f4k8pnshzfzsxv",
  "assetsUrl": "https://assets.braintreegateway.com",
  "authUrl": "https://auth.venmo.sandbox.braintreegateway.com",
  "venmo": "off",
  "challenges": [],
  "threeDSecureEnabled": true,
  "analytics": {
    "url": "https://origin-analytics-sand.sandbox.braintree-api.com/j9f4k8pnshzfzsxv"
  },
  "paypalEnabled": true,
  "paypal": {
    "billingAgreementsEnabled": true,
    "environmentNoNetwork": false,
    "unvettedMerchant": false,
    "allowHttp": true,
    "displayName": "Manchester Makerspace",
    "clientId": "AbqBGx5--vixOvzDklGcTGLbVlkt-jdcgbZePh7Yxs0eiZdIDeuoLha-i252CG8MTX7PHLAgTL1OxPUa",
    "privacyUrl": "http://example.com/pp",
    "userAgreementUrl": "http://example.com/tos",
    "baseUrl": "https://assets.braintreegateway.com",
    "assetsUrl": "https://checkout.paypal.com",
    "directBaseUrl": null,
    "environment": "offline",
    "braintreeClientId": "masterclient3",
    "merchantAccountId": "manchestermakerspace",
    "currencyIsoCode": "USD"
  }
})
