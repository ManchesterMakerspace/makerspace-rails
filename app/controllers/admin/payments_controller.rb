class Admin::PaymentsController < ApplicationController

  def index
    @payments = Payment.all.collect do |payment|
      payment.member ||= payment.find_member
      payment
    end
    render json: @payments
  end

  # def new
  #   @payment = Payment.new
  # end
  #
  # def create
  #   @payment = Payment.new(payment_params)
  #   if @payment.save
  #     redirect_to payments_path, notice: 'Success'
  #   else
  #     render :new, alert: 'Failure'
  #   end
  # end

  private
  def payment_params
    params.require(:payment).permit(:member)
  end
end
