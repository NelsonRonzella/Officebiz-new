<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderStep;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderStepFactory extends Factory
{
    protected $model = OrderStep::class;

    public function definition(): array
    {
        return [
            'order_id'      => Order::factory(),
            'title'         => fake()->words(3, true),
            'description'   => fake()->sentence(),
            'order'         => 1,
            'duration_days' => fake()->numberBetween(1, 30),
            'started_at'    => null,
            'finished_at'   => null,
        ];
    }

    public function iniciado(): static
    {
        return $this->state(['started_at' => now()]);
    }

    public function concluido(): static
    {
        return $this->state([
            'started_at'  => now()->subDays(2),
            'finished_at' => now(),
        ]);
    }
}
