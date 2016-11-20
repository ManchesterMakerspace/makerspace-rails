class MemberMailer < ApplicationMailer

  default from: 'test@manchestermakerspace.org'

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
end
