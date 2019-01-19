import * as React from "react";
import { Switch, Route } from "react-router";
import { connect } from "react-redux";

import { BillingPlan, Discount } from "app/entities/billingPlan";
import { getDiscounts, getPlans } from "api/billingPlans/transactions";
import { InvoiceableResource } from "app/entities/invoice";

export interface Context {
  plans: {
    loading: boolean;
    data: BillingPlan[];
    error: string;
    refresh: (types?: InvoiceableResource[]) => void;
  };
  discounts: {
    loading: boolean;
    data: Discount[];
    error: string;
    refresh: () => void;
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
    refresh: () => { return; },
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
      let data: BillingPlan[];
      let error: string;
      try {
        const response = await getPlans({ types });
        data = response.data.plans;
      } catch (e) {
        const { errorMessage } = e;
        error = errorMessage;
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

  private getDiscounts = () => {
    this.setState((state) => ({
      discounts: {
        ...state.discounts,
        loading: true,
      },
    }), async () => {
      let data: Discount[];
      let error: string;
      try {
        const response = await getDiscounts();
        data = response.data.discounts;
      } catch (e) {
        const { errorMessage } = e;
        error = errorMessage;
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