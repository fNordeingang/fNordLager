class CreateThings < ActiveRecord::Migration
  def change
    create_table :things do |t|
      t.string :name
      t.text :description
      t.string :barcode
      t.decimal :quantity

      t.timestamps
    end
  end
end
