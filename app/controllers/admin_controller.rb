class AdminController < ApplicationController
  before_action :authorized?

  def backup
    session = GoogleDrive::Session.from_config("config.json")
    session.upload_from_file("/home/will/Desktop/dev/makerspace_interface/dump/members/memberBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip", "memberBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip", convert: false)
    redirect_to members_path
  end

  private
  def authorized?
    unless current_member.try(:role) == 'admin'
      redirect_to root_path, alert: "You are not allowed to access that page."
    end
  end
end
