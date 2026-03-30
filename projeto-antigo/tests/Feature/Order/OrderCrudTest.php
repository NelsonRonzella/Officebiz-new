<?php

namespace Tests\Feature\Order;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Database\Factories\ProductFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class OrderCrudTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Listagem de pedidos
    // -------------------------------------------------------------------------

    public function test_admin_ve_todos_os_pedidos(): void
    {
        $admin    = User::factory()->admin()->create();
        $cliente  = User::factory()->cliente()->create();
        $licenciado = User::factory()->licenciado()->create();
        $product  = Product::factory()->create();

        Order::factory()->count(3)->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($admin)->get('/pedidos');

        $response->assertOk();
        $this->assertCount(3, Order::all());
    }

    public function test_cliente_ve_apenas_seus_pedidos(): void
    {
        $cliente1 = User::factory()->cliente()->create();
        $cliente2 = User::factory()->cliente()->create();
        $licenciado = User::factory()->licenciado()->create();
        $product  = Product::factory()->create();

        Order::factory()->count(2)->create([
            'user_id'    => $cliente1->id,
            'criado_por' => $licenciado->id,
            'product_id' => $product->id,
        ]);

        Order::factory()->count(3)->create([
            'user_id'    => $cliente2->id,
            'criado_por' => $licenciado->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($cliente1)->get('/pedidos');

        $response->assertOk();
        $this->assertEquals(2, Order::where('user_id', $cliente1->id)->count());
    }

    public function test_prestador_ve_pedidos_vinculados_a_ele(): void
    {
        $prestador  = User::factory()->prestador()->create();
        $outroPrest = User::factory()->prestador()->create();

        // vinculado ao prestador (qualquer status)
        Order::factory()->emAndamento()->create(['prestador' => $prestador->id]);
        Order::factory()->cancelado()->create(['prestador' => $prestador->id]);

        // vinculado ao outro prestador — não deve aparecer
        Order::factory()->emAndamento()->create(['prestador' => $outroPrest->id]);

        $this->actingAs($prestador)->get('/pedidos')->assertOk();

        $visiveis = Order::forUser($prestador)->get();
        $this->assertCount(2, $visiveis);
    }

    public function test_prestador_ve_pedidos_pagos_sem_prestador(): void
    {
        $prestador = User::factory()->prestador()->create();

        // pago e sem prestador — deve aparecer (pode aceitar)
        Order::factory()->pago()->create(['prestador' => null]);

        // sem prestador mas status diferente de pago — não deve aparecer
        Order::factory()->aguardandoPagamento()->create(['prestador' => null]);
        Order::factory()->cancelado()->create(['prestador' => null]);

        $this->actingAs($prestador)->get('/pedidos')->assertOk();

        $visiveis = Order::forUser($prestador)->get();
        $this->assertCount(1, $visiveis);
    }

    public function test_prestador_nao_ve_pedido_pago_de_outro_prestador(): void
    {
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();

        Order::factory()->pago()->create(['prestador' => $prestador2->id]);

        $visiveis = Order::forUser($prestador1)->get();
        $this->assertCount(0, $visiveis);
    }

    public function test_prestador_nao_pode_ver_detalhes_de_pedido_sem_prestador_nao_pago(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->aguardandoPagamento()->create(['prestador' => null]);

        $this->actingAs($prestador)
            ->get("/pedidos/{$order->id}")
            ->assertForbidden();
    }

    public function test_prestador_pode_ver_detalhes_de_pedido_pago_sem_prestador(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->pago()->create(['prestador' => null]);

        $this->actingAs($prestador)
            ->get("/pedidos/{$order->id}")
            ->assertOk();
    }

    public function test_licenciado_ve_apenas_pedidos_que_criou(): void
    {
        $licenciado1 = User::factory()->licenciado()->create();
        $licenciado2 = User::factory()->licenciado()->create();
        $cliente     = User::factory()->cliente()->create();
        $product     = Product::factory()->create();

        Order::factory()->count(2)->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado1->id,
            'product_id' => $product->id,
        ]);

        Order::factory()->count(4)->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado2->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($licenciado1)->get('/pedidos');

        $response->assertOk();
        $this->assertEquals(2, Order::where('criado_por', $licenciado1->id)->count());
    }

    // -------------------------------------------------------------------------
    // Criação de pedidos
    // -------------------------------------------------------------------------

    public function test_admin_pode_criar_pedido(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();
        $product = Product::factory()->pontual()->create();

        $response = $this->actingAs($admin)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
            'criado_por' => $admin->id,
            'status'     => OrderStatusEnum::AGUARDANDO_PAGAMENTO->value,
        ]);
    }

    public function test_licenciado_pode_criar_pedido(): void
    {
        Notification::fake();

        $licenciado = User::factory()->licenciado()->create();
        $cliente    = User::factory()->cliente()->create();
        $product    = Product::factory()->pontual()->create();

        $response = $this->actingAs($licenciado)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
            'criado_por' => $licenciado->id,
        ]);
    }

    public function test_pedido_criado_fica_com_status_aguardando_pagamento(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();
        $product = Product::factory()->create();

        $this->actingAs($admin)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ]);

        $order = Order::latest()->first();
        $this->assertTrue($order->isAguardandoPagamento());
    }

    public function test_pedido_pontual_cria_etapas_do_produto(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();
        $product = Product::factory()->pontual()->create();

        $product->steps()->createMany([
            ['title' => 'Etapa 1', 'description' => 'Desc 1', 'order' => 1, 'duration_days' => 5],
            ['title' => 'Etapa 2', 'description' => 'Desc 2', 'order' => 2, 'duration_days' => 3],
        ]);

        $this->actingAs($admin)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ]);

        $order = Order::latest()->first();
        $this->assertCount(2, $order->steps);
    }

    public function test_pedido_recorrente_cria_categorias_de_documentos(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();
        $product = Product::factory()->recorrente()->create();

        $product->documentCategories()->createMany([
            ['title' => 'Cat 1', 'description' => 'Desc 1', 'order' => 1],
            ['title' => 'Cat 2', 'description' => 'Desc 2', 'order' => 2],
        ]);

        $this->actingAs($admin)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ]);

        $order = Order::latest()->first();
        $this->assertCount(2, $order->documentCategories);
    }

    // -------------------------------------------------------------------------
    // Visualização de detalhes
    // -------------------------------------------------------------------------

    public function test_admin_pode_ver_qualquer_pedido(): void
    {
        $admin  = User::factory()->admin()->create();
        $order  = Order::factory()->create();

        $response = $this->actingAs($admin)->get("/pedidos/{$order->id}");
        $response->assertOk();
    }

    public function test_cliente_pode_ver_seu_proprio_pedido(): void
    {
        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->create(['user_id' => $cliente->id]);

        $response = $this->actingAs($cliente)->get("/pedidos/{$order->id}");
        $response->assertOk();
    }

    public function test_cliente_nao_pode_ver_pedido_de_outro_cliente(): void
    {
        $cliente1 = User::factory()->cliente()->create();
        $cliente2 = User::factory()->cliente()->create();
        $order    = Order::factory()->create(['user_id' => $cliente2->id]);

        $response = $this->actingAs($cliente1)->get("/pedidos/{$order->id}");
        $response->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Fluxo de status
    // -------------------------------------------------------------------------

    public function test_admin_pode_marcar_pedido_como_pago(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->aguardandoPagamento()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/pago");

        $this->assertEquals(OrderStatusEnum::PAGO, $order->fresh()->status);
    }

    public function test_nao_e_possivel_marcar_como_pago_se_nao_aguardando(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/pago");

        $this->assertEquals(OrderStatusEnum::EM_ANDAMENTO, $order->fresh()->status);
    }

    public function test_admin_pode_cancelar_pedido(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->aguardandoPagamento()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/cancelar");

        $this->assertEquals(OrderStatusEnum::CANCELADO, $order->fresh()->status);
    }

    public function test_nao_e_possivel_cancelar_pedido_ja_cancelado(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->cancelado()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/cancelar");

        $this->assertEquals(OrderStatusEnum::CANCELADO, $order->fresh()->status);
    }

    public function test_admin_pode_marcar_pedido_como_retorno(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/retorno");

        $this->assertEquals(OrderStatusEnum::RETORNO, $order->fresh()->status);
    }

    public function test_admin_pode_concluir_pedido_em_andamento(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/concluir");

        $this->assertEquals(OrderStatusEnum::CONCLUIDO, $order->fresh()->status);
    }

    public function test_admin_pode_concluir_pedido_em_retorno(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->retorno()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/concluir");

        $this->assertEquals(OrderStatusEnum::CONCLUIDO, $order->fresh()->status);
    }

    public function test_nao_pode_concluir_pedido_aguardando_pagamento(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->aguardandoPagamento()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/concluir");

        $this->assertEquals(OrderStatusEnum::AGUARDANDO_PAGAMENTO, $order->fresh()->status);
    }

    // -------------------------------------------------------------------------
    // Prestador aceita pedido
    // -------------------------------------------------------------------------

    public function test_prestador_pode_aceitar_pedido_pago_sem_prestador(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->pago()->create(['prestador' => null]);

        $this->actingAs($prestador)->patch("/pedido/{$order->id}/aceitar");

        $fresh = $order->fresh();
        $this->assertEquals($prestador->id, $fresh->prestador);
        $this->assertEquals(OrderStatusEnum::EM_ANDAMENTO, $fresh->status);
    }

    public function test_prestador_nao_pode_aceitar_pedido_ja_com_prestador(): void
    {
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $order      = Order::factory()->pago()->create(['prestador' => $prestador1->id]);

        $this->actingAs($prestador2)->patch("/pedido/{$order->id}/aceitar");

        $this->assertEquals($prestador1->id, $order->fresh()->prestador);
    }

    public function test_prestador_nao_pode_aceitar_pedido_nao_pago(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->aguardandoPagamento()->create(['prestador' => null]);

        $this->actingAs($prestador)->patch("/pedido/{$order->id}/aceitar");

        $this->assertNull($order->fresh()->prestador);
        $this->assertEquals(OrderStatusEnum::AGUARDANDO_PAGAMENTO, $order->fresh()->status);
    }

    // -------------------------------------------------------------------------
    // Troca de prestador (admin)
    // -------------------------------------------------------------------------

    public function test_admin_pode_trocar_prestador(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $order      = Order::factory()->emAndamento()->create(['prestador' => $prestador1->id]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", [
            'prestador_id' => $prestador2->id,
        ]);

        $this->assertEquals($prestador2->id, $order->fresh()->prestador);
        $this->assertDatabaseHas('order_prestador_logs', [
            'order_id'         => $order->id,
            'old_prestador_id' => $prestador1->id,
            'new_prestador_id' => $prestador2->id,
        ]);
    }
}
