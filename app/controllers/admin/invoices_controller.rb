class Admin::InvoicesController < AdminController
  include FastQuery
  before_action :find_invoice, only: [:update, :destroy]

  def index
    query = {}
    query[:resource_id] = admin_index_params[:resourceId] unless admin_index_params[:resourceId].nil?
    unless admin_index_params[:settled].nil?
      if to_bool(admin_index_params[:settled])
        query = query.merge({ :settled_at.ne => nil })
      else
        query = query.merge({ :settled_at => nil })
      end
    end

    unless admin_index_params[:types].nil?
      if admin_index_params[:types].include?("member") && admin_index_params[:types].include?("rental") 
        query = query.merge({ :resource_class.in => ["member", "rental"] })
      elsif admin_index_params[:types].include?("member") 
        query[:resource_class] = "member"
      elsif admin_index_params[:types].include?("rental") 
        query[:resource_class] = "rental"
      end
    end

    invoices = query.length > 0 ? Invoice.where(query) : Invoice.all
    invoices = query_resource(invoices)

    return render_with_total_items(invoices)
  end

  def create
    if params['invoice_option']
      raise ActionController::ParameterMissing.new(:id) if invoice_option_params[:id].nil?
      raise ActionController::ParameterMissing.new(:member_id) if invoice_option_params[:member_id].nil?
      member = Member.find(invoice_option_params[:member_id])
      raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: invoice_option_params[:member_id] }) if member.nil?
      invoice_option = InvoiceOption.find(invoice_option_params[:id])
      raise ::Mongoid::Errors::DocumentNotFound.new(InvoiceOption, { id: invoice_option_params[:id] }) if invoice_option.nil?
      if (invoice_option_params[:discount_id])
        discounts = ::BraintreeService::Discount.get_discounts(@gateway)
        invoice_discount = discounts.find { |d| d.id == invoice_option_params[:discount_id]}
      end
      invoice = invoice_option.build_invoice(member.id, Time.now, invoice_option_params[:resource_id], invoice_discount)

    else
      invoice = Invoice.new(invoice_params)
      invoice.save!
    end

    render json: invoice and return
  end

  def update
    # TODO this should be handled by the model not controller
    if !!invoice_params[:settled] && !@invoice.settled
      @invoice.settle_invoice
    else
      @invoice.update_attributes!(invoice_params)
    end
    render json: @invoice and return
  end

  def destroy
    @invoice.destroy
    render json: {}, status: 204 and return
  end

  private
  def invoice_params
    params.require(:invoice).permit(:description, 
                                    :items, 
                                    :settled, 
                                    :amount, 
                                    :quantity,
                                    :payment_type, 
                                    :resource_id, 
                                    :resource_class, 
                                    :due_date, 
                                    :member_id)
  end

  def invoice_option_params
    params.require(:invoice_option).permit(:id, :discount_id, :member_id, :resource_id)
  end

  def admin_index_params
    params.permit(:resourceId, :settled, types: [])
  end

  def find_invoice
    @invoice = Invoice.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: params[:id] }) if @invoice.nil?
  end
end