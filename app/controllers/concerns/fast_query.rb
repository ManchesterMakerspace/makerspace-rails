module FastQuery
  extend ActiveSupport::Concern
  @@items_per_page = 20
  included do
    # before_action :init_gateway
  end

  def query_resource(current_query, query_params)
    items_per_page = @@items_per_page
    page_num = query_params[:pageNum].to_i || 0
    start_index = items_per_page * page_num
    sort_by = query_params[:orderBy].empty? ? :lastname : query_params[:orderBy].to_sym
    order = query_params[:order].empty? ? :asc : query_params[:order].to_sym

    current_query.order_by(sort_by => order).skip(start_index).limit(items_per_page)
  end

  def render_with_total_items(current_query, render_options = nil)
    render_payload = { :json => current_query }
    render_payload = render_payload.merge(render_options) if render_options.is_a?(Hash)
    response.set_header("total-items", current_query.count)
    render render_payload and return
  end
end