class LoadingRampController < ApplicationController
  def ramp
    @last_things = Thing.order("updated_at DESC")
  end

  def good_in
    qty = params[:thing_in][:quantity].present? ?
            BigDecimal.new(params[:thing_in][:quantity]) : 1
    @thing = good_quantity(params[:thing_in][:barcode], qty)

    respond_to do |format|
      format.html { redirect_to loading_ramp_ramp_path }
      format.json { render json: @thing }
    end
  end

  def good_out
    qty = params[:thing_out][:quantity].present? ?
            -BigDecimal.new(params[:thing_out][:quantity]) : -1
    @thing = good_quantity(params[:thing_out][:barcode], qty)

    respond_to do |format|
      format.html { redirect_to loading_ramp_ramp_path }
      format.json { render json: @thing }
    end
  end


  private

  def good_quantity(bc, qty)
    @thing = Thing.find_by_barcode(bc)
    @thing.quantity += qty
    @thing.save
    @thing
  end
end
