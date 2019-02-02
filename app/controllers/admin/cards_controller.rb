class Admin::CardsController < AdminController

  def new
    @card = Card.new()
    reject = RejectionCard.where({'holder' => nil, 'timeOf' => {'$gt' => (Date.today - 1.day)}}).last
    if( !!reject )
      @card.uid = reject.uid || nil
    else
      @card.uid = nil
    end
    render json: @card
  end

  def create
    @card = Card.new(card_params)

    render json: {msg: 'Member missing'}, status: 500 and return if !@card.member

    cards = @card.member.access_cards.select { |c| (c.validity != 'lost') && (c.validity != 'stolen') && (c != @card)}
    raise Error::Conflict.new("Member has active cards. Cards must be disabled before creating new one.") if cards.length > 0

    @card.save!
    rejection_card = RejectionCard.find_by(uid: @card.uid)
    rejection_card.update(holder: @card.holder) unless rejection_card.nil?
    render json: @card and return
  end

  def index
    @cards = Card.where(member: Member.find(card_params[:member_id]))
    render json: @cards and return
  end

  def update
    @card = Card.find(params[:id])
    @card.update!(card_params)
    render json: @card and return
  end

  private
  def card_params
    params.require(:card).permit(:member_id, :uid, :card_location)
  end
end
