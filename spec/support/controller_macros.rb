module ControllerMacros
  def set_devise_mapping
    before(:each) do
      @request.env["devise.mapping"] = Devise.mappings[:member]
    end
  end
  def login_admin
    before(:each) do
      @request.env["devise.mapping"] = Devise.mappings[:member]
      user = create(:member, :admin)
      sign_in user
    end
  end

  def login_user
    before(:each) do
      @request.env["devise.mapping"] = Devise.mappings[:member]
      user = create(:member)
      sign_in user
    end
  end
end
