<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name'        => fake()->words(3, true),
            'description' => fake()->sentence(),
            'price'       => fake()->randomFloat(2, 50, 5000),
            'type'        => Product::TYPE_PONTUAL,
            'active'      => true,
        ];
    }

    public function pontual(): static
    {
        return $this->state(['type' => Product::TYPE_PONTUAL]);
    }

    public function recorrente(): static
    {
        return $this->state(['type' => Product::TYPE_RECORRENTE]);
    }

    public function inactive(): static
    {
        return $this->state(['active' => false]);
    }
}
