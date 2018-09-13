class InvoicesController < ApplicationController
  def index
    invoices = Invoice.where(member_id: current_member.id)
    render json: invoices and return
  end
end