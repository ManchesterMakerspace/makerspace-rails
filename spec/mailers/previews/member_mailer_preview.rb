class MemberMailerPreview < ActionMailer::Preview

  def welcome_email
    MemberMailer.welcome_email(last_email)
  end

  def welcome_email_manual_register
    MemberMailer.welcome_email_manual_register(last_email, "token")
  end

  def member_registered
    MemberMailer.member_registered(last_member)
  end

  def send_document
    MemberMailer.send_document("member_contract", last_member, "this is a pdf string")
  end

  def request_document
    MemberMailer.request_document("Member Contract", last_member)
  end

  def contract_updated
    MemberMailer.contract_updated(last_member)
  end

  private

  def last_member
    Member.last || FactoryBot.create(:member)
  end

  def last_email
    last_member.email
  end
end