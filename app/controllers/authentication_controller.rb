class AuthenticationController < ApplicationController
  before_action :authenticate_member!
  before_action :authenticated?

  private
  def authenticated?
    raise ::Error::Unauthorized.new unless member_signed_in?
  end
end
