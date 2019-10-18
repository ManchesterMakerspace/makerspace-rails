module FastQuery
  extend ActiveSupport::Concern
  @@items_per_page = 20

  private

  def query_resource(current_query, custom_query = nil)
    return current_query unless current_query.class == Mongoid::Criteria
    query = custom_query || query_params
    items_per_page = @@items_per_page
    page_num = query[:pageNum].to_i || 0
    start_index = items_per_page * page_num
    sort_by = query[:orderBy].nil? || query[:orderBy].empty? ? :lastname : query[:orderBy].to_sym
    order = query[:order].nil? || query[:order].empty? ? :asc : query[:order].to_sym

    current_query.order_by(sort_by => order).skip(start_index).limit(items_per_page)
  end

  def render_with_total_items(current_query, render_options = nil)
    render_payload = { :json => current_query }
    render_payload = render_payload.merge(render_options) if render_options.is_a?(Hash)
    response.set_header("total-items", current_query.count)
    render render_payload and return
  end

  def to_bool(param)
    truthy = (param == "true" || param == true)
    return truthy
  end
end

def query_params
  params.permit(:orderBy, :order, :pageNum, :search)
end