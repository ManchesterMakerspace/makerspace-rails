class EarnedMembershipController < ApplicationController
  before_action :set_earned_membership, only: [:edit, :update, :destroy, :show]

  def index
    membership = EarnedMembership.all
    render json: membership and return
  end

  def show
    render json: @member and return
  end

  def update
    @membership.update_attributes(earned_membership_params)
    render json: @membership and return
  end

  def create
    membership = EarnedMembership.new(earned_membership_params)
    membership.save!
    render json: membership and return
  end

  private
  def earned_membership_params
    params.require(:membership).permit()
  end

  def set_earned_membership
    @membership = EarnedMembership.find_by(id: params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(EarnedMembership, { id: params[:id] }) if @member.nil?
  end
end
