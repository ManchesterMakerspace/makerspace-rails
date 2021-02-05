class Admin::CardsController < AdminController

  def new
    @card = Card.new()
    reject = RejectionCard.where({holder: nil, timeOf: {'$gt' => (Date.today - 1.day)}}).sort(timeOf: 1).last
    @card.uid = reject.uid if !!reject
    render json: @card, adapter: :attributes and return
  end

  def create
    @card = Card.new(create_card_params)
    raise Error::NotFound.new() unless @card.member

    cards = @card.member.access_cards.select { |c| (c.validity != 'lost') && (c.validity != 'stolen') && (c != @card)}
    cards.each { |card| card.invalidate }

    @card.save!
    rejection_card = RejectionCard.find_by(uid: @card.uid)
    rejection_card.update_attributes!(holder: @card.holder) unless rejection_card.nil?
    render json: @card, adapter: :attributes and return
  end

  def index
    member = Member.find(card_query_params[:member_id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: card_query_params[:member_id] }) if member.nil?
    @cards = Card.where(member: member)
    render json: @cards, adapter: :attributes and return
  end

  def update
    @card = Card.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Card, { id: params[:id] }) if @card.nil?
    @card.update_attributes!(update_card_params)
    render json: @card, adapter: :attributes and return
  end

  private
  def create_card_params
    params.require([:member_id, :uid])
    params.permit(:member_id, :uid)
  end

  def update_card_params
    params.require(:card_location)
    params.permit(:card_location)
  end

  def card_query_params
    params.require(:member_id)
    params.permit(:member_id)
  end
end
