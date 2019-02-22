class Admin::MembersController < AdminController
  before_action :set_member, only: [:update]

  def create
    @member = Member.new(get_camel_case_params)
    @member.save!
    render json: @member and return
  end

  def update
    date = @member.expirationTime
    @member.update!(get_camel_case_params)
    @member.reload
    render json: @member and return
  end

  private
  def member_params
    params.require(:member).permit(:firstname, :lastname, :role, :email, :status, :expiration_time, :renew)
  end

  def get_camel_case_params
    camel_case_props = {
      expiration_time: :expirationTime
    }
    params = member_params()
    camel_case_props.each do | key, value|
      params[value] = params.delete(key) unless params[key].nil?
    end
    params
  end

  def set_member
    @member = Member.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: params[:id] }) if @member.nil?
  end
end
