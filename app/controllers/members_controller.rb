class MembersController < ApplicationController
    before_action :set_member, only: [:show, :edit, :update, :allowed?, :revoke, :restore]
    before_action :set_workshop, only: [:edit, :update]
    before_action :allowed?, only: [:edit, :update]

    def index
        @members = Member.all.sort_by(&:fullname)
        respond_to do |format|
          format.html { render :index }
          format.json { render json: @members }
        end
    end

    def show
      @workshops = Workshop.all.sort_by(&:name)
      respond_to do |format|
        format.html { render :show }
        format.json { render json: @member }
      end
    end

    def edit
    end

    def update
        if @member.update(member_params)
          respond_to do |format|
            format.html { redirect_to @member, notice: "#{@member.fullname} was updated"}
            format.json { render json: @member }
          end
        else
          respond_to do |format|
            format.html { render :edit, alert: "Update failed:  #{@member.errors.full_messages}" }
            format.json { render json: @member, alert: "Update failed" }
          end
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
          respond_to do |format|
            format.html { render :index }
            format.json { render :json, alert: 'Value missing' }
          end
        else
          @members = Member.where(params[:field] => params[:value])
          respond_to do |format|
            format.html { render :index}
            format.json { render json: @members  }
          end
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

    def set_member
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
