<?php

namespace Database\Factories;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'product_id' => Product::factory(),
            'status'     => OrderStatusEnum::AGUARDANDO_PAGAMENTO,
            'criado_por' => User::factory(),
            'prestador'  => null,
            'progresso'  => 0,
        ];
    }

    public function aguardandoPagamento(): static
    {
        return $this->state(['status' => OrderStatusEnum::AGUARDANDO_PAGAMENTO]);
    }

    public function pago(): static
    {
        return $this->state(['status' => OrderStatusEnum::PAGO]);
    }

    public function emAndamento(): static
    {
        return $this->state(['status' => OrderStatusEnum::EM_ANDAMENTO]);
    }

    public function cancelado(): static
    {
        return $this->state(['status' => OrderStatusEnum::CANCELADO]);
    }

    public function concluido(): static
    {
        return $this->state(['status' => OrderStatusEnum::CONCLUIDO]);
    }

    public function retorno(): static
    {
        return $this->state(['status' => OrderStatusEnum::RETORNO]);
    }

    public function comPrestador(User $prestador): static
    {
        return $this->state(['prestador' => $prestador->id]);
    }
}
