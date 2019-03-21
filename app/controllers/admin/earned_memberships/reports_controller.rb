class Admin::EarnedMemberships::ReportsController < AdminController
  include FastQuery

  def index
    @reports = EarnedMembership::Report.where(earned_membership_id: params[:earned_membership_id])
    return render_with_total_items(query_resource(@reports), { each_serializer: EarnedMembership::ReportSerializer, root: "reports" })
  end
end