import * as React from "react";

import {
  Plan,
  Discount,
  listBillingPlans,
  listBillingDiscounts,
  isApiErrorResponse,
  InvoiceableResource
} from "makerspace-ts-api-client";

export interface Context {
  plans: {
    loading: boolean;
    data: Plan[];
    error: string;
    refresh: (types?: InvoiceableResource[]) => void;
  };
  discounts: {
    loading: boolean;
    data: Discount[];
    error: string;
    refresh: (types?: InvoiceableResource[]) => void;
  };
}

const defaultContext: Context = {
  plans: {
    loading: false,
    data: [],
    error: "",
    refresh: (type) => { return; },
  },
  discounts: {
    loading: false,
    data: [],
    error: "",
    refresh: (type) => { return; },
  },
};

export const BillingContext: React.Context<Context> = React.createContext(defaultContext);

interface ContextState extends Context { }

class BillingContextContainer extends React.Component<{}, ContextState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      ...defaultContext,
      plans: {
        ...defaultContext.plans,
        refresh: this.getPlans,
      },
      discounts: {
        ...defaultContext.discounts,
        refresh: this.getDiscounts,
      },
    };
  }

  private getPlans = (types?: InvoiceableResource[]) => {
    this.setState((state) => ({
      plans: {
        ...state.plans,
        loading: true,
      },
    }), async () => {
      let data: Plan[];
      let error: string;
      const result = await listBillingPlans({ types });

      if (isApiErrorResponse(result)) {
        error = result.error.message;
      } else {
        data = result.data;
      }
      this.setState((state) => ({
        plans: {
          ...state.plans,
          loading: false,
          data: data || [],
          error: error || "",
        },
      }));
    });
  }

  private getDiscounts = (types?: InvoiceableResource[]) => {
    this.setState((state) => ({
      discounts: {
        ...state.discounts,
        loading: true,
      },
    }), async () => {
      let data: Discount[];
      let error: string;

      const result = await listBillingDiscounts({ types });
      if (isApiErrorResponse(result)) {
        error = result.error.message;
      } else {
        data = result.data;
      }
      this.setState((state) => ({
        discounts: {
          ...state.discounts,
          loading: false,
          data: data || [],
          error: error || "",
        },
      }));
    });
  }

  public async componentDidMount(): Promise<void> {
    this.getPlans();
    this.getDiscounts();
  }

  public render(): JSX.Element {
    return (
      <BillingContext.Provider value={this.state}>
        {this.props.children}
      </BillingContext.Provider>
    );
  }
}

export default BillingContextContainer;