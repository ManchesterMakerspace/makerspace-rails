class MemberMailer < ApplicationMailer

  default from: 'contact@manchestermakerspace.org'

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.model_mailer.expired_member_notification.subject
  #
  def expired_member_notification(member)
    @member = member
    mail to: "will.lynch91@gmail.com", subject: 'Test Mailer'
  end

  def expiring_member_notification(member)
    @member = member
    mail to: "will.lynch91@gmail.com", subject: 'Test Mailer'
  end

  def welcome_email(email)
    @url = url_for(action: :application, controller: 'application')
    mail to: email, subject: "Welcome to Manchester Makerspace!"
  end

  def welcome_email_manual_register(member, password_token)
    @token = password_token
    @member = member
    mail to: @member.email, subject: "Welcome to Manchester Makerspace!"
  end

  def member_registered(member)
    @member = member
    email = Rails.env.production? && ENV['BT_ENV'].to_sym == :production ? 'contact@manchestermakerspace.org' : 'test@manchestermakerspace.org'
    mail to: email, subject: 'New Member Registered'
  end
end
