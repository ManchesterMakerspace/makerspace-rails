require 'test_helper'

class WorkshopsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get workshops_index_url
    assert_response :success
  end

  test "should get show" do
    get workshops_show_url
    assert_response :success
  end

end
