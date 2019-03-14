class PermissionsController < AuthenticationController
  before_action :find_member

  def show
    render json: { permissions: @member.get_permissions } and return
  end

  private
  def find_member
    # Look up member if admin is looking for another user
    @member = Member.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: params[:id] }) if @member.nil?
    raise ::Error::Unauthorized.new unless @member.id == current_member.id || is_admin?
  end
end