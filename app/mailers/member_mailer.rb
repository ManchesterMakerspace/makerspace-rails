class MemberMailer < ApplicationMailer

  default from: 'contact@manchestermakerspace.org'

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.model_mailer.expired_member_notification.subject
  #

  # Sent when signing up with PayPal & sending a registration link
  def welcome_email(email)
    @url = url_for(action: :application, controller: 'application')
    mail to: email, subject: "Welcome to Manchester Makerspace!"
  end

  # Sent when signing up in person, manually
  def welcome_email_manual_register(member_email, password_token)
    @url = url_for(action: :application, controller: 'application')
    @url += "resetPassword/#{password_token}"
    @member_email = member_email
    mail to: member_email, subject: "Welcome to Manchester Makerspace!"
  end

  # Sent when a new member finishes self registering
  def member_registered(member_id)
    @member = Member.find(member_id)
    mail to: @member.email, cc: "contact@manchestermakerspace.org", subject: "Thank you for registering #{@member.fullname}"
  end

  # Send copy of signed docs to member
  def send_document(document_name, member_id, document_string)
    member = Member.find(member_id)
    attachments["#{document_name}.pdf"] = document_string
    @doc_name = document_name.titleize
    mail to: member.email, subject: "Manchester Makerspace - Signed #{@doc_name}"
  end

  def request_document(document_type, member_id)
    @member = Member.find(member_id)
    @document_type = document_type
    @url = url_for(action: :application, controller: 'application')
    @url += "members/#{member_id}"
    mail to: @member.email, subject: "Action Required - Manchester Makerspace"
  end

  def contract_updated(member_id)
    @member = Member.find(member_id)
    @url = url_for(action: :application, controller: 'application')
    @url += "members/#{member_id}"
    mail to: @member.email, subject: "Manchester Makerspace Membership Updates"
  end
end
