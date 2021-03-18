class MarktetingMailingPreview < ActionMailer::Preview

  def request_signup
    MarketingMailer.request_signup(last_member)
  end

  private
  def last_member
    Member.last || FactoryBot.create(:member)
  end
end