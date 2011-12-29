require 'test_helper'

class LoadingRampControllerTest < ActionController::TestCase
  test "should get ramp" do
    get :ramp
    assert_response :success
  end

  test "should get good_in" do
    get :good_in
    assert_response :success
  end

  test "should get good_out" do
    get :good_out
    assert_response :success
  end

end
