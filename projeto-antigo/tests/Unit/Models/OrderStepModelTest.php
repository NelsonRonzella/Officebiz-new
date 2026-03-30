<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\OrderStep;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderStepModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_relacao_order_retorna_instancia_de_order(): void
    {
        $order = Order::factory()->create();
        $step  = OrderStep::factory()->create(['order_id' => $order->id]);

        // A coluna 'order' (posição) sombreia o accessor mágico — usar o método de relacionamento diretamente
        $related = $step->order()->first();

        $this->assertInstanceOf(Order::class, $related);
        $this->assertEquals($order->id, $related->id);
    }

    public function test_started_at_e_castado_como_datetime(): void
    {
        $order = Order::factory()->create();
        $step  = OrderStep::factory()->create([
            'order_id'   => $order->id,
            'started_at' => now(),
        ]);

        $this->assertInstanceOf(Carbon::class, $step->fresh()->started_at);
    }

    public function test_finished_at_e_castado_como_datetime(): void
    {
        $order = Order::factory()->create();
        $step  = OrderStep::factory()->concluido()->create(['order_id' => $order->id]);

        $this->assertInstanceOf(Carbon::class, $step->fresh()->finished_at);
    }

    public function test_step_sem_duration_days_tem_valor_null(): void
    {
        $order = Order::factory()->create();
        $step  = OrderStep::factory()->create([
            'order_id'      => $order->id,
            'duration_days' => null,
        ]);

        $this->assertNull($step->fresh()->duration_days);
    }

    public function test_step_com_finished_at_preenchido_esta_concluido(): void
    {
        $order = Order::factory()->create();
        $step  = OrderStep::factory()->concluido()->create(['order_id' => $order->id]);

        $this->assertNotNull($step->fresh()->finished_at);
    }
}
