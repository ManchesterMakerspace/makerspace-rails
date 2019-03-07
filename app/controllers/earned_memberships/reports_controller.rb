class EarnedMemberships::ReportsController < ApplicationController
  include FastQuery

  def index
    unless current_member.earned_membership?
      raise ::Error::InsufficientPermissions.new()
    end
    @reports = EarnedMembership::Report.where(earned_membership_id: current_member.earned_membership.id)
    return render_with_total_items(query_resource(@reports), { each_serializer: EarnedMembership::ReportSerializer, root: "reports" })
  end

  def create
    @report = EarnedMembership::Report.new(report_params)
    @report.save!
    render json: @report, serializer: EarnedMembership::ReportSerializer, root: "report" and return
  end

  private
  def report_params
    params[:report][:report_requirements_attributes] = params[:report].delete(:report_requirements) if params[:report][:report_requirements]
    params.require(:report).permit(:earned_membership_id, report_requirements_attributes: [
      :requirement_id, :reported_count, member_ids: []
    ])
  end
end