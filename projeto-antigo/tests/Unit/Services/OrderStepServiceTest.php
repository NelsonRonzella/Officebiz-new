<?php

namespace Tests\Unit\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderStepService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderStepServiceTest extends TestCase
{
    use RefreshDatabase;

    private OrderStepService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(OrderStepService::class);
    }

    // -------------------------------------------------------------------------
    // createStepsFromProduct
    // -------------------------------------------------------------------------

    public function test_cria_etapas_a_partir_do_produto(): void
    {
        $product = Product::factory()->pontual()->create();
        $product->steps()->createMany([
            ['title' => 'Etapa 1', 'description' => 'Desc 1', 'order' => 1, 'duration_days' => 5],
            ['title' => 'Etapa 2', 'description' => 'Desc 2', 'order' => 2, 'duration_days' => 3],
            ['title' => 'Etapa 3', 'description' => 'Desc 3', 'order' => 3, 'duration_days' => 7],
        ]);

        $order = Order::factory()->create(['product_id' => $product->id]);

        $this->service->createStepsFromProduct($order);

        $this->assertCount(3, $order->fresh()->steps);
    }

    public function test_cria_etapas_com_dados_corretos(): void
    {
        $product = Product::factory()->pontual()->create();
        $product->steps()->create([
            'title'         => 'Análise documental',
            'description'   => 'Verificar documentos',
            'order'         => 1,
            'duration_days' => 10,
        ]);

        $order = Order::factory()->create(['product_id' => $product->id]);

        $this->service->createStepsFromProduct($order);

        $this->assertDatabaseHas('order_steps', [
            'order_id'      => $order->id,
            'title'         => 'Análise documental',
            'description'   => 'Verificar documentos',
            'order'         => 1,
            'duration_days' => 10,
        ]);
    }

    public function test_produto_sem_etapas_nao_cria_nada(): void
    {
        $product = Product::factory()->pontual()->create();
        $order   = Order::factory()->create(['product_id' => $product->id]);

        $this->service->createStepsFromProduct($order);

        $this->assertCount(0, $order->fresh()->steps);
    }

    // -------------------------------------------------------------------------
    // startFirstStep
    // -------------------------------------------------------------------------

    public function test_inicia_primeira_etapa(): void
    {
        $product = Product::factory()->pontual()->create();
        $order   = Order::factory()->emAndamento()->create(['product_id' => $product->id]);

        $order->steps()->createMany([
            ['title' => 'Etapa 1', 'description' => '', 'order' => 1, 'duration_days' => 5],
            ['title' => 'Etapa 2', 'description' => '', 'order' => 2, 'duration_days' => 3],
        ]);

        $this->service->startFirstStep($order);

        $order->refresh();
        $this->assertNotNull($order->current_step_id);

        $firstStep = $order->steps()->orderBy('order')->first();
        $this->assertNotNull($firstStep->started_at);
    }

    public function test_nao_inicia_etapa_se_nao_houver_etapas(): void
    {
        $order = Order::factory()->emAndamento()->create();

        $this->service->startFirstStep($order);

        $this->assertNull($order->fresh()->current_step_id);
    }

    // -------------------------------------------------------------------------
    // advance
    // -------------------------------------------------------------------------

    public function test_avanca_para_proxima_etapa(): void
    {
        $order = Order::factory()->emAndamento()->create();

        $step1 = $order->steps()->create([
            'title' => 'Etapa 1', 'description' => '', 'order' => 1,
            'duration_days' => 5, 'started_at' => now(),
        ]);
        $step2 = $order->steps()->create([
            'title' => 'Etapa 2', 'description' => '', 'order' => 2, 'duration_days' => 3,
        ]);

        $order->update(['current_step_id' => $step1->id]);

        $this->service->advance($order);

        $order->refresh();
        $this->assertEquals($step2->id, $order->current_step_id);
        $this->assertNotNull($step1->fresh()->finished_at);
        $this->assertNotNull($step2->fresh()->started_at);
    }

    public function test_avanca_sem_proxima_etapa_zera_current_step(): void
    {
        $order = Order::factory()->emAndamento()->create();

        $step = $order->steps()->create([
            'title' => 'Última etapa', 'description' => '', 'order' => 1,
            'duration_days' => 5, 'started_at' => now(),
        ]);

        $order->update(['current_step_id' => $step->id]);

        $this->service->advance($order);

        $this->assertNull($order->fresh()->current_step_id);
        $this->assertNotNull($step->fresh()->finished_at);
    }

    public function test_advance_sem_current_step_nao_faz_nada(): void
    {
        $order = Order::factory()->emAndamento()->create(['current_step_id' => null]);

        // Não deve lançar exceção
        $this->service->advance($order);

        $this->assertNull($order->fresh()->current_step_id);
    }
}
