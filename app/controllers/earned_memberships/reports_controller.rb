class EarnedMemberships::ReportsController < AuthenticationController
  include FastQuery::MongoidQuery
  before_action :verify_earned_member

  def index
    @reports = EarnedMembership::Report.where(earned_membership_id: current_member.earned_membership.id)
    return render_with_total_items(query_resource(@reports), { each_serializer: EarnedMembership::ReportSerializer, adapter: :attributes })
  end

  def create
    raise ::Error::Forbidden.new() unless current_member.earned_membership.id.as_json == report_params[:earned_membership_id]
    @report = EarnedMembership::Report.new(report_params)
    @report.save!
    enque_message("#{@report.earned_membership.member.fullname} just submitted a report.")
    render json: @report, serializer: EarnedMembership::ReportSerializer, adapter: :attributes and return
  end

  private
  def report_params
    params.require([:earned_membership_id, :report_requirements])

    params[:report_requirements_attributes] = params[:report_requirements]
    params.permit(:earned_membership_id, report_requirements_attributes: [
      :requirement_id, :reported_count, member_ids: []
    ])
  end

  def verify_earned_member
    raise ::Error::Forbidden.new() unless current_member.earned_membership?
  end
end