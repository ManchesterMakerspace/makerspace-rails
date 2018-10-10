import { Url } from "app/constants";
import { QueryParams } from "app/interfaces";
import { Rental } from "app/entities/rental";
import { AccessCard } from "app/entities/card";
import { BillingPlan } from "app/entities/billingPlan";
import { MemberDetails } from "app/entities/member";
import { Subscription } from "app/entities/subscription";

enum Method {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Delete = "DELETE",
  Patch = "PATCH"
}
interface HttpRequest {
  method: Method;
  path: string;
  body?: string;
  queryStringParameters?: { [key: string]: any }[]
}
interface HttpResponse {
  statusCode: number;
  body?: string;
  headers?: {
    name: string;
    value: string
  }[]
}
export interface MockRequest {
  httpRequest: HttpRequest;
  httpResponse: HttpResponse;
}

const mockserver = require('mockserver-client').mockServerClient(process.env.MOCKSERVER_DOMAIN || 'localhost', 1080);
mockserver.setDefaultHeaders([
  { "name": "Content-Type", "values": ["application/json; charset=utf-8"] },
  { "name": "Cache-Control", "values": ["no-cache, no-store"] },
  { "name": "Access-Control-Allow-Origin", "values": [`http://${process.env.APP_DOMAIN}:${process.env.PORT}`]},
]);

export const mockRequests = {
  accessCard: {
    get: {
      ok: (id: string, accessCard: Partial<AccessCard>) => ({
        httpRequest: {
          method: "GET",
          path: `/api/admin/cards/${id}.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(accessCard)
        }
      })
    },
    put: {
      ok: (id: string, accessCard: Partial<AccessCard>) => ({
        httpRequest: {
          method: "PUT",
          path: `/api/admin/cards/${id}.json`,
          body: JSON.stringify(accessCard)
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(accessCard)
        }
      })
    }
  },
  billingPlans: {
    get: {
      ok: (plans: Partial<BillingPlan>) => ({
        httpRequest: {
          method: "GET",
          path: `/${Url.Billing.Plans}.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(plans)
        }
      })
    }
  },
  members: {
    get: {
      ok: (members: Partial<MemberDetails>[], queryParams?: QueryParams) => ({
        httpRequest: {
          method: "GET",
          path: `/${Url.Members}.json`,
          queryStringParameters: Object.entries(queryParams).map(([name, values]) => ({ name, values }))
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(members)
        }
      })
    },
  },
  member: {
    get: {
      ok: (id: string, member: Partial<MemberDetails>) => ({
        httpRequest: {
          method: "GET",
          path: `/api/admin/members/${id}.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({member})
        }
      })
    },
    put: {
      ok: (id: string, member: Partial<MemberDetails>) => ({
        httpRequest: {
          method: "PUT",
          path: `/api/admin/members/${id}.json`,
          body: JSON.stringify(member)
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(member)
        }
      })
    }
  },
  rentals: {
    get: {
      ok: (rentals: Partial<Rental>[], queryParams?: QueryParams) => ({
        httpRequest: {
          method: "GET",
          path: `/${Url.Rentals}.json`,
          queryStringParameters: JSON.stringify(Object.entries(queryParams).map(([name, values]) => ({ name, values })))
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(rentals)
        }
      })
    },
  },
  signIn: {
    ok: (member: Partial<MemberDetails>): MockRequest => ({
      httpRequest: {
        method: Method.Post,
        path: `/${Url.Auth.SignIn}.json`,
      },
      httpResponse: {
        statusCode: 200,
        body: JSON.stringify({ member })
      }
    }),
    error: () => ({
      httpRequest: {
        method: Method.Post,
        path: `/${Url.Auth.SignIn}.json`,
      },
      httpResponse: {
        statusCode: 400,
      }
    })
  },
  signOut: {
    ok: () => ({
      httpRequest: {
        method: "DELETE",
        path: `/${Url.Auth.SignIn}.json`,
      },
      httpResponse: {
        statusCode: 200,
      }
    }),
  },
  signUp: {
    ok: (member: Partial<MemberDetails>) => ({
      httpRequest: {
        method: "POST",
        path: `/${Url.Auth.SignIn}.json`,
      },
      httpResponse: {
        statusCode: 200,
        body: JSON.stringify({ member }),
      }
    }),
  },
  subscriptions: {
    get: {
      ok: (subscriptions: Partial<Subscription>[], queryParams?: QueryParams) => ({
        httpRequest: {
          method: "GET",
          path: `/${Url.Billing.Subscriptions}.json`,
          queryStringParameters: JSON.stringify(Object.entries(queryParams).map(([name, values]) => ({ name, values })))
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(subscriptions)
        }
      })
    }
  }
}


// By default, mocks 1 response, but can be configured to mock unlimited or specified num
export const mock = (requestObject: MockRequest, times: number = 1, unlimited: boolean = false) => {
  const configuredRequest = {
    ...requestObject,
    times: {
      unlimited,
      remainingTimes: times,
    }
  };
  return mockserver.mockAnyResponse(configuredRequest);
}

export const reset = () => mockserver.reset();
