class MembersController < ApplicationController
    before_action :set_user, only: [:show, :edit, :update, :allowed?, :revoke, :restore]
    before_action :set_workshop, only: [:edit, :update]
    before_action :allowed?, only: [:edit, :update]

    def index
        @members = Member.all.sort_by(&:fullname)
    end

    def show
      @workshops = Workshop.all.sort_by(&:name)
    end

    def new
        @member = Member.new
    end

    def create
        @member = Member.new(member_params)
        if @member.save
            redirect_to member_path(@member), notice: "Member created" and return
        end
        render 'new'
    end

    def edit
    end

    def update
        if @member.update(member_params)
            redirect_to member_path(@member), notice: "#{@member.fullname} was updated" and return
        else
          render action: 'edit', alert: "Update failed:  #{@member.errors.full_messages}"
        end
    end

    def revoke
        @member.revoke
        redirect_to members_path, notice: "#{@member.fullname}'s membership has been revoked!" and return
    end

    def restore
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
      params.require(:member).permit(:fullname, :email, :learned_skill_ids =>[])
    end

    def set_user
      @member = Member.find(params[:id])
    end

    def set_workshop
      @workshop = Workshop.find(params[:workshop_id])
    end

    def allowed?
      set_workshop
      unless is_officer? || @member == current_member
        redirect_to root_path, alert: "You are not allowed to access that page."
      end
    end
end
