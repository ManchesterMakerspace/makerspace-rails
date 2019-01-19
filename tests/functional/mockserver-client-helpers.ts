import { Url } from "app/constants";
import { QueryParams } from "app/interfaces";
import { Rental, RentalQueryParams } from "app/entities/rental";
import { AccessCard } from "app/entities/card";
import { BillingPlan } from "app/entities/billingPlan";
import { MemberDetails } from "app/entities/member";
import { Subscription } from "app/entities/subscription";
import { AuthForm } from "ui/auth/interfaces";
import { Invoice, InvoiceQueryParams } from "app/entities/invoice";
import { InvoiceOptionQueryParams } from "api/invoices/interfaces";

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
    name: string,
    value: string,
  }[];
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

type AnyQueryParam = QueryParams;
const objectToQueryParams = (params: AnyQueryParam) => {
  if (!(params)) { return; }
  return Object.entries(params).map(([name, values]) => ({
    values: Array.isArray(values) ? values : [values],
    name: Array.isArray(values) ? `${name}[]` : name
  }));
}

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
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(members.length) }],
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
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({member})
        }
      })
    }
  },
  passwordReset: {
    requestReset: {
      ok: (email: string): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: "/api/members/password.json",
          body: JSON.stringify({ member: { email } })
        },
        httpResponse: {
          statusCode: 200,
        }
      })
    },
    updatePassword: {
      ok: (token: string, password: string): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: "/api/members/password.json",
          body: JSON.stringify(
            {
              member: {
                resetPasswordToken: token,
                password
              }
            }
          )
        },
        httpResponse: {
          statusCode: 200,
        }
      })
    }
  },
  rejectionCard: {
    get: {
      ok: (card: any) => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Admin.AccessCards}/new.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(card)
        }
      })
    }
  },
  rentals: {
    show: {
      ok: (rental: Partial<Rental>, queryParams: RentalQueryParams = {}, admin?: boolean): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.Rentals : Url.Rentals}/${rental.id}.json`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ rental })
        }
      })
    },
    get: {
      ok: (rentals: Partial<Rental>[], queryParams: RentalQueryParams = {}, admin?: boolean): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.Rentals : Url.Rentals}.json`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(rentals.length) }],
          statusCode: 200,
          body: JSON.stringify({ rentals })
        }
      })
    },
    post: {
      ok: (rental: Partial<Rental>): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: `/${Url.Admin.Rentals}.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ rental })
        }
      })
    },
    put: {
      ok: (rental: Partial<Rental>): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: `/${Url.Admin.Rentals}/${rental.id}.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ rental })
        }
      })
    },
    delete: {
      ok: (id: string): MockRequest => ({
        httpRequest: {
          method: Method.Delete,
          path: `/${Url.Admin.Rentals}/${id}.json`,
        },
        httpResponse: {
          statusCode: 204,
        }
      })
    }
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
        statusCode: 204,
      }
    }),
  },
  signUp: {
    ok: (member: Partial<AuthForm | MemberDetails>): MockRequest => ({
      httpRequest: {
        method: Method.Post,
        path: `/${Url.Auth.SignUp}.json`,
      },
      httpResponse: {
        statusCode: 200,
        body: JSON.stringify({ member }),
      }
    }),
    error: (statusCode?: string): MockRequest => ({
      httpRequest: {
        method: Method.Post,
        path: `/${Url.Auth.SignUp}.json`,
      },
      httpResponse: {
        statusCode: 400,
        body: "Email already exists"
      }
    })
  },
  subscriptions: {
    get: {
      ok: (subscriptions: Partial<Subscription>[], queryParams?: QueryParams): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Billing.Subscriptions}.json`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify(subscriptions)
        }
      })
    }
  },
  invoices: {
    get: {
      ok: (invoices: Partial<Invoice>[], queryParams?: InvoiceQueryParams, admin?: boolean): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.Invoices : Url.Invoices}.json`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(invoices.length) }],
          statusCode: 200,
          body: JSON.stringify({invoices})
        }
      })
    },
    post: {
      ok: (invoice: Invoice): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: `/${Url.Admin.Invoices}.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ invoice })
        }
      })
    },
    put: {
      ok: (invoice: Invoice): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: `/${Url.Admin.Invoices}/${invoice.id}.json`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ invoice })
        }
      })
    },
    delete: {
      ok: (invoiceId: string): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: `/${Url.Admin.Invoices}/${invoiceId}.json`,
        },
        httpResponse: {
          statusCode: 204,
        }
      })
    }
  },
  invoiceOptions: {
    get: {
      ok: (invoiceOptions: Partial<Invoice>[], queryParams?: InvoiceOptionQueryParams): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.InvoiceOptions}.json`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(invoiceOptions.length) }],
          statusCode: 200,
          body: JSON.stringify({invoiceOptions})
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
