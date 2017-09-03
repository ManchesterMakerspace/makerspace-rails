class Admin::CardsController < ApplicationController
  before_action :set_member, only: [:create]

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
    byebug
    cards = @card.member.access_cards.select { |c| (c.validity != 'lost') && (c.validity != 'stolen') && (c != @card)}
    if cards.length > 0
      render json: {msg: 'Member has Active cards', status: 400} and return
    end
    if @card.save
      RejectionCard.find_by(uid: @card.uid).update(holder: @card.holder)
      render json: @card and return
    else
      render json: {status: 500}, status: 500 and return
    end
  end

  def show
    @cards = Card.where(member: Member.find(params[:id]))
    render json: @cards and return
  end

  def update
    @card = Card.find_by(id: params[:id])
    if @card.update(card_params)
      render json: @card and return
    else
      render json: {status: 500}, status: 500 and return
    end
  end

  private
  def card_params
    params.require(:card).permit(:member_id, :uid, :card_location)
  end

  def set_member
    @member = Member.find_by(id: params["member_id"]) || Member.find_by(id: params["card"]["member_id"])
  end
end
