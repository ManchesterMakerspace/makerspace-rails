class EarnedMembershipsController < AuthenticationController
  before_action :set_earned_membership, only: [:show]
  before_action :is_earned_member
  before_action :authenticate_member!

  def show
    render json: @membership and return
  end

  private
  def is_earned_member
    unless @membership == current_member.earned_membership
      raise ::Error::Forbidden.new()
    end
  end

  def set_earned_membership
    @membership = EarnedMembership.find_by(id: params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(EarnedMembership, { id: params[:id] }) if @membership.nil?
  end
end
