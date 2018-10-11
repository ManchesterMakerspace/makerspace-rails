import { Url } from "app/constants";
import { QueryParams } from "app/interfaces";
import { Rental } from "app/entities/rental";
import { AccessCard } from "app/entities/card";
import { BillingPlan } from "app/entities/billingPlan";
import { MemberDetails } from "app/entities/member";
import { Subscription } from "app/entities/subscription";
import { AuthForm } from "ui/auth/interfaces";

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
  queryStringParameters?: {
    name: string,
    values: string[]
  }[]
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
  { "name": "Access-Control-Allow-Origin", "values": [`http://${process.env.APP_DOMAIN || 'localhost'}:${process.env.PORT || 3002}`]},
]);

export const mockRequests = {
  accessCard: {
    get: {
      ok: (id: string, accessCard: Partial<AccessCard>): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/api/admin/cards/${id}.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(accessCard)
        }
      })
    },
    put: {
      ok: (id: string, accessCard: Partial<AccessCard>): MockRequest => ({
        httpRequest: {
          method: Method.Put,
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
      ok: (plans: Partial<BillingPlan>): MockRequest => ({
        httpRequest: {
          method: Method.Get,
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
      ok: (members: Partial<MemberDetails>[], queryParams?: QueryParams): MockRequest => ({
        httpRequest: {
          method: Method.Get,
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
      ok: (id: string, member: Partial<MemberDetails>, admin: boolean = false): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/api${admin ? '/admin' : ''}/members/${id}.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({member})
        }
      })
    },
    put: {
      ok: (id: string, member: Partial<MemberDetails>): MockRequest => ({
        httpRequest: {
          method: Method.Put,
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
      ok: (rentals: Partial<Rental>[], queryParams?: QueryParams): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Rentals}.json`,
          queryStringParameters: (Object.entries(queryParams).map(([name, values]) => ({ name, values })))
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(rentals)
        }
      })
    },
  },
  signIn: {
    ok: (member: Partial<AuthForm | MemberDetails>): MockRequest => ({
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
        method: Method.Delete,
        path: `/${Url.Auth.SignIn}.json`,
      },
      httpResponse: {
        statusCode: 200,
      }
    }),
  },
  signUp: {
    ok: (member: Partial<AuthForm | MemberDetails>): MockRequest => ({
      httpRequest: {
        method: Method.Post,
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
      ok: (subscriptions: Partial<Subscription>[], queryParams?: QueryParams): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Billing.Subscriptions}.json`,
          queryStringParameters: (Object.entries(queryParams).map(([name, values]) => ({ name, values })))
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
