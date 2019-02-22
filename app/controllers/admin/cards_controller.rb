class Admin::CardsController < AdminController

  def new
    @card = Card.new()
    reject = RejectionCard.where({'holder' => nil, 'timeOf' => {'$gt' => (Date.today - 1.day)}}).last
    @card.uid = reject.uid if !!reject
    render json: @card and return
  end

  def create
    raise ::ActionController::ParameterMissing.new(:member_id) unless card_params[:member_id]
    @card = Card.new(card_params)
    raise Error::NotFound.new() unless @card.member

    cards = @card.member.access_cards.select { |c| (c.validity != 'lost') && (c.validity != 'stolen') && (c != @card)}
    cards.each { |card| card.invalidate }

    @card.save!
    rejection_card = RejectionCard.find_by(uid: @card.uid)
    rejection_card.update_attributes!(holder: @card.holder) unless rejection_card.nil?
    render json: @card and return
  end

  def index
    raise ::ActionController::ParameterMissing.new(:member_id) unless card_params[:member_id]
    member = Member.find(card_params[:member_id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: card_params[:member_id] }) if member.nil?
    @cards = Card.where(member: member)
    render json: @cards and return
  end

  def update
    @card = Card.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Card, { id: params[:id] }) if @card.nil?
    @card.update_attributes!(card_params)
    render json: @card and return
  end

  private
  def card_params
    params.require(:card).permit(:member_id, :uid, :card_location)
  end
end
