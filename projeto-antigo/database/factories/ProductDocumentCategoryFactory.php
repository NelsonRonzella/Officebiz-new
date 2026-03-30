<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductDocumentCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductDocumentCategoryFactory extends Factory
{
    protected $model = ProductDocumentCategory::class;

    public function definition(): array
    {
        return [
            'product_id'  => Product::factory(),
            'title'       => fake()->words(3, true),
            'description' => fake()->sentence(),
            'order'       => 1,
        ];
    }
}
