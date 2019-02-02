class GroupsController < ApplicationController
    before_action :set_group, only: [:show]

    def index
      @groups = Group.where(:expiry.gt => (Time.now.strftime('%s').to_i * 1000)).sort_by(&:groupName)
      render json: @groups and return
    end

    def show
      render json: @group and return
    end

    private
    def set_group
      @group = Group.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new if @group.nil?
    end
end
