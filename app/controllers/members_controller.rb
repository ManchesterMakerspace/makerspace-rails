class MembersController < ApplicationController
    before_action :set_user, only: [:show, :edit, :update, :allowed?]
    before_action :set_workshop, only: [:edit]
    before_action :allowed?, only: [:edit, :update]

    def index
        @members = Member.all
    end

    def show
        @member = Member.find(params[:id])
    end

    def new
        @member = Member.new
    end

    def create
        @member = Member.new(member_params)
        if @member.save
            redirect_to member_path(@member), notice: "Member created" and return
        else
          redirect_to new_member_path(@member), notice: "Error" and return
        end

        render 'new'
    end

    def edit
        @member = Member.find(params[:id])
    end

    def update
        @member = Member.find(params[:id])

        if @member.update_attributes(member_params)
            redirect_to member_path(@member), notice: "#{@member.fullname} was updated" and return
        end
        render 'show'
    end

    def revoke
        @member = Member.find(params[:id])
        @member.revoke
        redirect_to members_path, notice: "#{@member.fullname}'s membership has been revoked!" and return
    end

    def restore
        @member = Member.find(params[:id])
        @member.restore
        redirect_to members_path, notice: "#{@member.fullname}'s membership has been restored!" and return
    end

    def search_by
        if params[:value].empty?
          redirect_to members_path and return
        else
          @members = Member.where(params[:field] => params[:value])
          render 'index' and return
        end
    end

    def mailer
        @members = Member.all
        @members.each { |member| member.membership_mailer }
        redirect_to members_path
    end

    private
    def member_params
      params.require(:member).permit(:fullname, :cardID, :status, :expirationTime)
    end

    def set_user
      @member = Member.find(params[:id])
    end

    def set_workshop
      @workshop = Workshop.find_by(id: params[:workshop_id])
    end

    def allowed?
      set_workshop
      unless current_user.try(:admin?) || @member == current_user || @workshop.try(:officer) == current_user
        redirect_to root_path, alert: "You are not allowed to access that page."
      end
    end
end
