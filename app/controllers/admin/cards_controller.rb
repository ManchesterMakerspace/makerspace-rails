class Admin::CardsController < ApplicationController
  before_action :set_member, only: [:create]
  before_action :set_card, only: [:new, :create]

  def new
    reject = RejectionCard.where(holder: nil).last
    if( !!reject )
      @card.uid = reject.uid || 'RejectionCard has no ID'
    else
      @card.uid = 'Not Found'
    end
    render json: @card
  end

  def create
    @card.uid = params["card"]["uid"]
    if @card.save
      RejectionCard.find_by(uid: @card.uid).update(holder: @card.holder)
      redirect_to member_path(@card.member), notice: 'Success'
    else
      render :new, alert: 'Failure'
    end
  end

  private
  def set_member
    @member = Member.find_by(id: params["member_id"]) || Member.find_by(id: params["card"]["member_id"])
  end

  def set_card
    @card = Card.new(member: @member)
  end
end
