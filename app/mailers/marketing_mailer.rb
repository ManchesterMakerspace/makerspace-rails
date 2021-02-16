class MarketingMailer < ApplicationMailer
  after_action :prevent_unwanted_send

  def prevent_unwanted_send
    prevent_mail = Member.find_by(email: mail.to, silence_emails: true)
    
    if !!prevent_mail
      mail.perform_deliveries = false
    end
  end

  # Ask users that aren't members to sign up
  def request_signup(member_id)
    @member = Member.find(member_id)
    mail to: @member.email, subject: "Manchester Makerspace Membership"
  end
end