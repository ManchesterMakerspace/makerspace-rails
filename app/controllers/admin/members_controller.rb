class Admin::MembersController < AdminController
  before_action :set_member, only: [:update]

  def create
    @member = Member.new(get_camel_case_params(create_member_params()))
    @member.save!
    @member.reload
    send_set_password_email
    render json: @member, adapter: :attributes and return
  end

  def update
    date = @member.expirationTime
    @member.update!(get_camel_case_params(update_member_params()))
    notify_renewal(date)
    @member.reload
    render json: @member, adapter: :attributes and return
  end

  private
  def create_member_params
    params.require([:firstname, :lastname, :email, :address])
    params.permit(:firstname, :lastname, :role, :email, :status, :member_contract_on_file, :phone, :notes, address: [:street, :city, :state, :postal_code])
  end

  def update_member_params
    params.permit(:firstname, :lastname, :role, :email, :status, :expiration_time, :renew, :member_contract_on_file, :notes,
      :phone, :subscription, address: [:street, :unit, :city, :state, :postal_code])
  end

  def get_camel_case_params(member_params)
    camel_case_props = {
      expiration_time: :expirationTime,
      member_contract_on_file: :memberContractOnFile,
    }
    params = member_params
    camel_case_props.each do | key, value|
      params[value] = params.delete(key) unless params[key].nil?
    end
    params
  end

  def set_member
    @member = Member.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: params[:id] }) if @member.nil?
  end

  def notify_renewal(init)
    final = @member.expirationTime
    # Check if adding expiration too
    if final &&
        (init.nil? ||
        (Time.at(final / 1000) - Time.at((init || 0) / 1000) > 1.day))
      @member.send_renewal_slack_message(current_member)
    end
  end

  def send_set_password_email
    raw_token, hashed_token = ::Devise.token_generator.generate(Member, :reset_password_token)
    @member.reset_password_token = hashed_token
    @member.reset_password_sent_at = Time.now.utc
    @member.save!
    MemberMailer.welcome_email_manual_register(@member.email, raw_token).deliver_now
  end
end
