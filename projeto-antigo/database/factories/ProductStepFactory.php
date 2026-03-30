<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductStep;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductStepFactory extends Factory
{
    protected $model = ProductStep::class;

    public function definition(): array
    {
        return [
            'product_id'    => Product::factory(),
            'title'         => fake()->words(3, true),
            'description'   => fake()->sentence(),
            'order'         => 1,
            'duration_days' => fake()->numberBetween(1, 30),
        ];
    }
}
