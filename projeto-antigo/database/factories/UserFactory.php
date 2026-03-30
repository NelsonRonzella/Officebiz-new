<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        return [

            'name' => fake()->name(),

            'email' => fake()->unique()->safeEmail(),

            'cpf' => rand(0,1) 
                ? fake()->unique()->numerify('###########') 
                : null,

            'cnpj' => null,

            'telefone' => fake()->phoneNumber(),

            'endereco' => fake()->streetName(),

            'numero' => fake()->buildingNumber(),

            'bairro' => fake()->word(),

            'cidade' => fake()->city(),

            'estado' => fake()->state(),

            'email_verified_at' => now(),

            'password' => static::$password ??= Hash::make('password'),

            'remember_token' => Str::random(10),

        ];

    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin', 'active' => true]);
    }

    public function licenciado(): static
    {
        return $this->state(['role' => 'licenciado', 'active' => true]);
    }

    public function cliente(): static
    {
        return $this->state(['role' => 'cliente', 'active' => true]);
    }

    public function prestador(): static
    {
        return $this->state(['role' => 'prestador', 'active' => true]);
    }
}