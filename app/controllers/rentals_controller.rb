class RentalsController < AuthenticationController
    include FastQuery
    include ::Service::GoogleDrive
    before_action :set_rental, only: [:show, :update]

  def index
    @rentals = Rental.where(member_id: current_member.id)
    return render_with_total_items(query_resource(@rentals))
  end

  def show
    render json: @rental and return
  end

  def update
    # Non admins can only update themselves
    @member = @rental.member
    raise Error::Forbidden.new unless @member.id == current_member.id
    raise ActionController::ParameterMissing.new(:signature) if update_params[:signature].nil?

    begin
      encoded_signature = update_params[:signature].split(",")[1]
      if encoded_signature
        upload_document("rental_agreement", @member, { rental: @rental }, encoded_signature)
        MemberMailer.send_document("rental_agreement", @member.id.as_json, encoded_signature).deliver_later
        @rental.update_attributes!(contract_on_file: true)
      end
    rescue Error::Google::Upload => err
      @messages.push("Error uploading #{@member.fullname}'s rental agreement signature'. Error: #{err}")
    end

    render json: @rental and return
  end

  private
  def set_rental
    @rental = Rental.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Rental, { id: params[:id] }) if @rental.nil?
  end

  def update_params
    params.require(:rental).permit(:signature)
  end
end
