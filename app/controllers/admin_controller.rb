class AdminController < ApplicationController
  before_action :authenticate_member!
  before_action :authorized?

  private
  def authorized?
    raise ::Error::InsufficientPermissions.new unless is_admin?
  end
end
