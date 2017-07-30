class Admin::PaymentsController < ApplicationController
  before_action :find_payment, only: [:update]

  def index
    @payments = Payment.all.collect do |payment|
      payment.member ||= payment.find_member
      payment
    end
    render json: @payments
  end

  def update
    @payment.member = Member.find_by(id: params[:payment][:member][:id])
    if @payment.update(payment_params)
      render json: @payment
    else
      render status: 500
    end
  end

  private
  def payment_params
    params.require(:payment).permit(:member, :txn_id)
  end

  def find_payment
    @payment = Payment.find_by(txn_id: params[:id]) || Payment.find_by(txn_id: params[:payment][:txn_id])
  end
end
