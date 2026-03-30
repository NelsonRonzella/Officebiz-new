<?php

namespace Tests\Unit\Services;

use App\Models\Order;
use App\Models\OrderPrestadorLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderPrestadorLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_log_criado_ao_trocar_prestador(): void
    {
        $admin      = User::factory()->admin()->create();
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $order      = Order::factory()->emAndamento()->create(['prestador' => $prestador1->id]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", [
            'prestador_id' => $prestador2->id,
        ]);

        $this->assertDatabaseHas('order_prestador_logs', [
            'order_id'         => $order->id,
            'new_prestador_id' => $prestador2->id,
        ]);
    }

    public function test_log_criado_ao_remover_prestador(): void
    {
        $admin     = User::factory()->admin()->create();
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->emAndamento()->create(['prestador' => $prestador->id]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", [
            'prestador_id' => null,
        ]);

        $this->assertDatabaseHas('order_prestador_logs', [
            'order_id'         => $order->id,
            'old_prestador_id' => $prestador->id,
            'new_prestador_id' => null,
        ]);
    }

    public function test_log_tem_campos_corretos(): void
    {
        $admin      = User::factory()->admin()->create();
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $order      = Order::factory()->emAndamento()->create(['prestador' => $prestador1->id]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", [
            'prestador_id' => $prestador2->id,
        ]);

        $log = OrderPrestadorLog::where('order_id', $order->id)->latest()->first();

        $this->assertNotNull($log);
        $this->assertEquals($order->id, $log->order_id);
        $this->assertEquals($prestador1->id, $log->old_prestador_id);
        $this->assertEquals($prestador2->id, $log->new_prestador_id);
    }

    public function test_multiplos_logs_apos_multiplas_trocas(): void
    {
        $admin      = User::factory()->admin()->create();
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $prestador3 = User::factory()->prestador()->create();
        $order      = Order::factory()->emAndamento()->create(['prestador' => $prestador1->id]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", ['prestador_id' => $prestador2->id]);
        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", ['prestador_id' => $prestador3->id]);
        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", ['prestador_id' => null]);

        $count = OrderPrestadorLog::where('order_id', $order->id)->count();

        $this->assertGreaterThanOrEqual(3, $count);
    }
}
