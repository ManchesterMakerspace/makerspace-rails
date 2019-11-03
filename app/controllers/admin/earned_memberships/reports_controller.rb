class Admin::EarnedMemberships::ReportsController < AdminController
  include FastQuery::MongoidQuery
  before_action :set_membership

  def index
    @reports = @membership.reports
    return render_with_total_items(query_resource(@reports), { each_serializer: EarnedMembership::ReportSerializer, root: "reports" })
  end

  private
  def set_membership
    @membership = EarnedMembership.find(params[:earned_membership_id])
    raise ::Mongoid::Errors::DocumentNotFound.new(EarnedMembership, { id: params[:id] }) if @membership.nil?
  end
end