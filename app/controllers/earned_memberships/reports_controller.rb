class EarnedMemberships::ReportsController < ApplicationController
  include FastQuery

  def index
    @reports = EarnedMembership::Report.where(member_id: current_member.id)
    return render_with_total_items(query_resource(@reports), { each_serializer: EarnedMembership::ReportSerializer, root: "reports" })
  end

  def create
    @report = EarnedMembership::Report.new(report_params)
    @report.save!
    render json: @report and return
  end

  private
  def report_params
    params.require(:report).permit(:earned_membership_id, report_requirements: [
      :requirement_id, :reported_count, member_ids: []
    ])
  end
end