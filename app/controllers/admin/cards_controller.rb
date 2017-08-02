class Admin::CardsController < ApplicationController
  before_action :set_member, only: [:create]

  def new
    @card = Card.new()
    reject = RejectionCard.where(holder: nil).last
    if( !!reject )
      @card.uid = reject.uid || nil
    else
      @card.uid = nil
    end
    render json: @card
  end

  def create
    @card = Card.new(card_params)
    if @card.save
      RejectionCard.find_by(uid: @card.uid).update(holder: @card.holder)
      render json: @card
    else
      render status: 500
    end
  end

  def update
    @card = Card.find_by(id: params[:id])
    if @card.update(card_params)
      render json: @card
    else
      render status: 500
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
