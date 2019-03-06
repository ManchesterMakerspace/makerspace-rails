class EarnedMembershipsController < ApplicationController
  before_action :is_earned_member
  before_action :set_earned_membership, only: [:show]

  def show
    render json: @membership, serializer: EarnedMembershipSerializer, root: "membership" and return
  end

  private
  def is_earned_member
     unless current_member.earned_membership? &&
      current_member.earned_membership.id.to_s === params[:id]
      raise ::Error::InsufficientPermissions.new()
    end
  end

  def set_earned_membership
    @membership = EarnedMembership.find_by(id: params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(EarnedMembership, { id: params[:id] }) if @membership.nil?
  end
end
