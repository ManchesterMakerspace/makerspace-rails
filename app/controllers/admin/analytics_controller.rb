class Admin::AnalyticsController < AdminController

  def index
    analytics = {
      total_members: Service::Analytics::Members.query_total_members().count,
      new_members: Service::Analytics::Members.query_new_members().count,
      subscribed_members: Service::Analytics::Members.query_subscribed_members().count,
      past_due_invoices: Service::Analytics::Invoices.query_past_due().count,
      refunds_pending: Service::Analytics::Invoices.query_refunds_pending().count,
    }

    render :json => { :analytics => analytics.deep_transform_keys! { |key| key.to_s.camelize(:lower) } } and return
  end
end
