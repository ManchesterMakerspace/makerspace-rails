class RegistrationsController < ApplicationController
  include BraintreeGateway
  include ApplicationHelper
  respond_to :json

  def new
    email = new_member_params[:email]
    member = Member.find_by(email: email)
    if member
      error = "Cannot send registration to #{email}. Account already exists"
      enque_message(error)
      raise ::Error::AccountExists
    end
    MemberMailer.welcome_email(email).deliver_later
    render json: {}, status: 204 and return
  end

  def create
    @member = Member.new(member_params)
    @member.save!
    @member.reload
    sign_in(@member)
    MemberMailer.member_registered(@member.id.to_s).deliver_later
    render json: @member, adapter: :attributes and return
  end

  private
  def new_member_params
    params.require(:email)
    params.permit(:email)
  end 

  def member_params
    params.require([:firstname, :lastname, :email, :password])
    params.permit(:firstname, :lastname, :email, :password,
      :phone, address: [:street, :unit, :city, :state, :postal_code])
  end
end
