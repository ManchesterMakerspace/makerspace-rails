class EarnedMemberships::ReportsController < AuthenticationController
  include FastQuery
  before_action :verify_earned_member

  def index
    @reports = EarnedMembership::Report.where(earned_membership_id: current_member.earned_membership.id)
    return render_with_total_items(query_resource(@reports), { each_serializer: EarnedMembership::ReportSerializer, root: "reports" })
  end

  def create
    raise ::Error::InsufficientPermissions.new() unless current_member.earned_membership.id.as_json == report_params[:earned_membership_id]
    @report = EarnedMembership::Report.new(report_params)
    @report.save!
    @messages.push("#{@report.earned_membership.member.fullname} just submitted a report.")
    render json: @report, serializer: EarnedMembership::ReportSerializer, root: "report" and return
  end

  private
  def report_params
    params[:report][:report_requirements_attributes] = params[:report].delete(:report_requirements) if params[:report][:report_requirements]
    params.require(:report).permit(:earned_membership_id, report_requirements_attributes: [
      :requirement_id, :reported_count, member_ids: []
    ])
  end

  def verify_earned_member
    raise ::Error::InsufficientPermissions.new() unless current_member.earned_membership?
  end
end