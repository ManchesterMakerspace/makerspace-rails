class MemberMailer < ApplicationMailer

  default from: 'contact@manchestermakerspace.org'

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.model_mailer.expired_member_notification.subject
  #
  def welcome_email(email)
    @url = url_for(action: :application, controller: 'application')
    mail to: email, subject: "Welcome to Manchester Makerspace!"
  end

  def welcome_email_manual_register(member, password_token)
    @url = url_for(action: :application, controller: 'application')
    @url += "resetPassword/#{password_token}"
    @member = member
    mail to: @member.email, subject: "Welcome to Manchester Makerspace!"
  end

  def member_registered(member_id)
    @member = Member.find(member_id)
    mail to: "contact@manchestermakerspace.org", subject: 'New Member Registered'
  end

  def send_document(document_name, member_id, signature = nil)
    member = Member.find(member_id)
    document = ::Service::GoogleDrive.generate_document_string(document_name, { member: member }, signature)
    attachments["#{document_name}.pdf"] = document
    @doc_name = document_name.titleize
    mail to: member.email, subject: "Manchester Makerspace - Signed #{@doc_name}"
  end
end
