<?php

namespace Tests\Unit\Services;

use App\Models\Order;
use App\Services\OrderProgressService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderProgressServiceTest extends TestCase
{
    use RefreshDatabase;

    private OrderProgressService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(OrderProgressService::class);
    }

    public function test_progresso_zero_se_nenhuma_etapa_concluida(): void
    {
        $order = Order::factory()->emAndamento()->create();

        $order->steps()->createMany([
            ['title' => 'Etapa 1', 'description' => '', 'order' => 1, 'duration_days' => 5, 'started_at' => now()],
            ['title' => 'Etapa 2', 'description' => '', 'order' => 2, 'duration_days' => 3],
        ]);

        $this->service->recalculate($order);

        $this->assertEquals(0, $order->fresh()->progresso);
    }

    public function test_progresso_50_quando_metade_concluida(): void
    {
        $order = Order::factory()->emAndamento()->create();

        $order->steps()->createMany([
            ['title' => 'Etapa 1', 'description' => '', 'order' => 1, 'duration_days' => 5,
             'started_at' => now()->subDay(), 'finished_at' => now()],
            ['title' => 'Etapa 2', 'description' => '', 'order' => 2, 'duration_days' => 5,
             'started_at' => now()],
        ]);

        $this->service->recalculate($order);

        $this->assertEquals(50, $order->fresh()->progresso);
    }

    public function test_progresso_100_quando_todas_concluidas(): void
    {
        $order = Order::factory()->emAndamento()->create();

        $order->steps()->createMany([
            ['title' => 'E1', 'description' => '', 'order' => 1, 'duration_days' => 2,
             'started_at' => now()->subDays(3), 'finished_at' => now()->subDay()],
            ['title' => 'E2', 'description' => '', 'order' => 2, 'duration_days' => 2,
             'started_at' => now()->subDay(), 'finished_at' => now()],
        ]);

        $this->service->recalculate($order);

        $this->assertEquals(100, $order->fresh()->progresso);
    }

    public function test_progresso_zerado_se_pedido_nao_em_andamento(): void
    {
        $order = Order::factory()->cancelado()->create(['progresso' => 75]);

        $this->service->recalculate($order);

        $this->assertEquals(0, $order->fresh()->progresso);
    }

    public function test_progresso_sem_etapas_nao_atualiza(): void
    {
        $order = Order::factory()->emAndamento()->create(['progresso' => 0]);

        $this->service->recalculate($order);

        // Sem etapas, mantém 0 (retorna cedo sem atualizar)
        $this->assertEquals(0, $order->fresh()->progresso);
    }
}
