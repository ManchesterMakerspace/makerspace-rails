# Preview all emails at http://localhost:3000/rails/mailers/model_mailer
class ModelMailerPreview < ActionMailer::Preview

  # Preview this email at http://localhost:3000/rails/mailers/model_mailer/expired_member_notification
  def expired_member_notification
    ModelMailer.expired_member_notification
  end

end
