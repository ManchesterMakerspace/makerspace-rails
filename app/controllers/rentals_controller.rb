class RentalsController < AuthenticationController
    include FastQuery::MongoidQuery
    before_action :set_rental, only: [:show, :update]

  def index
    @rentals = Rental.where(member_id: current_member.id)
    return render_with_total_items(query_resource(@rentals), { each_serializer: RentalSerializer, adapter: :attributes })
  end

  def show
    render json: @rental, adapter: :attributes and return
  end

  def update
    # Non admins can only update themselves
    @member = @rental.member
    raise Error::Forbidden.new unless @member.id == current_member.id

    encoded_signature = update_params[:signature].split(",")[1]
    if encoded_signature
      DocumentUploadJob.perform_later(encoded_signature, "rental_agreement", @rental.id.as_json)
      @rental.update_attributes!(contract_signed_date: Date.today)
    end

    render json: @rental, adapter: :attributes and return
  end

  private
  def set_rental
    @rental = Rental.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Rental, { id: params[:id] }) if @rental.nil?
  end

  def update_params
    params.require(:signature)
    params.permit(:signature)
  end
end
