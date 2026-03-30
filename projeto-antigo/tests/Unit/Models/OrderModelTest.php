<?php

namespace Tests\Unit\Models;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderModelTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helpers de status
    // -------------------------------------------------------------------------

    public function test_is_aguardando_pagamento(): void
    {
        $order = Order::factory()->aguardandoPagamento()->create();
        $this->assertTrue($order->isAguardandoPagamento());
        $this->assertFalse($order->isEmAndamento());
        $this->assertFalse($order->isCancelado());
    }

    public function test_is_em_andamento(): void
    {
        $order = Order::factory()->emAndamento()->create();
        $this->assertTrue($order->isEmAndamento());
        $this->assertFalse($order->isAguardandoPagamento());
        $this->assertFalse($order->isConcluido());
    }

    public function test_is_cancelado(): void
    {
        $order = Order::factory()->cancelado()->create();
        $this->assertTrue($order->isCancelado());
        $this->assertFalse($order->isEmAndamento());
    }

    public function test_is_concluido(): void
    {
        $order = Order::factory()->concluido()->create();
        $this->assertTrue($order->isConcluido());
        $this->assertFalse($order->isCancelado());
    }

    public function test_is_pago(): void
    {
        $order = Order::factory()->pago()->create();
        $this->assertTrue($order->isPago());
        $this->assertFalse($order->isAguardandoPagamento());
    }

    public function test_is_retorno(): void
    {
        $order = Order::factory()->retorno()->create();
        $this->assertTrue($order->isRetorno());
        $this->assertFalse($order->isEmAndamento());
    }

    // -------------------------------------------------------------------------
    // hasPrestador / isPrestador
    // -------------------------------------------------------------------------

    public function test_has_prestador_quando_prestador_definido(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->create(['prestador' => $prestador->id]);
        $this->assertTrue($order->hasPrestador());
    }

    public function test_has_prestador_false_quando_sem_prestador(): void
    {
        $order = Order::factory()->create(['prestador' => null]);
        $this->assertFalse($order->hasPrestador());
    }

    public function test_is_prestador_retorna_true_para_o_prestador_correto(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->create(['prestador' => $prestador->id]);
        $this->assertTrue($order->isPrestador($prestador));
    }

    public function test_is_prestador_retorna_false_para_outro_usuario(): void
    {
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $order      = Order::factory()->create(['prestador' => $prestador1->id]);
        $this->assertFalse($order->isPrestador($prestador2));
    }

    // -------------------------------------------------------------------------
    // canBeViewedBy
    // -------------------------------------------------------------------------

    public function test_admin_pode_ver_qualquer_pedido(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();
        $this->assertTrue($order->canBeViewedBy($admin));
    }

    public function test_cliente_pode_ver_seu_proprio_pedido(): void
    {
        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->create(['user_id' => $cliente->id]);
        $this->assertTrue($order->canBeViewedBy($cliente));
    }

    public function test_cliente_nao_pode_ver_pedido_de_outro(): void
    {
        $cliente1 = User::factory()->cliente()->create();
        $cliente2 = User::factory()->cliente()->create();
        $order    = Order::factory()->create(['user_id' => $cliente2->id]);
        $this->assertFalse($order->canBeViewedBy($cliente1));
    }

    public function test_licenciado_pode_ver_pedido_que_criou(): void
    {
        $licenciado = User::factory()->licenciado()->create();
        $order      = Order::factory()->create(['criado_por' => $licenciado->id]);
        $this->assertTrue($order->canBeViewedBy($licenciado));
    }

    public function test_licenciado_nao_pode_ver_pedido_de_outro(): void
    {
        $licenciado1 = User::factory()->licenciado()->create();
        $licenciado2 = User::factory()->licenciado()->create();
        $order       = Order::factory()->create(['criado_por' => $licenciado2->id]);
        $this->assertFalse($order->canBeViewedBy($licenciado1));
    }

    public function test_prestador_pode_ver_pedido_pago_sem_prestador(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->pago()->create(['prestador' => null]);
        $this->assertTrue($order->canBeViewedBy($prestador));
    }

    public function test_prestador_nao_pode_ver_pedido_sem_prestador_nao_pago(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->aguardandoPagamento()->create(['prestador' => null]);
        $this->assertFalse($order->canBeViewedBy($prestador));
    }

    public function test_prestador_pode_ver_seu_pedido(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->create(['prestador' => $prestador->id]);
        $this->assertTrue($order->canBeViewedBy($prestador));
    }

    public function test_prestador_nao_pode_ver_pedido_de_outro_prestador(): void
    {
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $order      = Order::factory()->create(['prestador' => $prestador2->id]);
        $this->assertFalse($order->canBeViewedBy($prestador1));
    }

    // -------------------------------------------------------------------------
    // Scope forUser
    // -------------------------------------------------------------------------

    public function test_scope_for_user_admin_retorna_todos(): void
    {
        $admin   = User::factory()->admin()->create();
        $produto = Product::factory()->create();

        Order::factory()->count(5)->create(['product_id' => $produto->id]);

        $result = Order::forUser($admin)->count();
        $this->assertEquals(5, $result);
    }

    public function test_scope_for_user_cliente_retorna_apenas_seus_pedidos(): void
    {
        $cliente1 = User::factory()->cliente()->create();
        $cliente2 = User::factory()->cliente()->create();
        $product  = Product::factory()->create();

        Order::factory()->count(2)->create(['user_id' => $cliente1->id, 'product_id' => $product->id]);
        Order::factory()->count(3)->create(['user_id' => $cliente2->id, 'product_id' => $product->id]);

        $result = Order::forUser($cliente1)->count();
        $this->assertEquals(2, $result);
    }

    public function test_scope_for_user_licenciado_retorna_apenas_pedidos_criados_por_ele(): void
    {
        $licenciado1 = User::factory()->licenciado()->create();
        $licenciado2 = User::factory()->licenciado()->create();
        $produto     = Product::factory()->create();

        Order::factory()->count(3)->create(['criado_por' => $licenciado1->id, 'product_id' => $produto->id]);
        Order::factory()->count(2)->create(['criado_por' => $licenciado2->id, 'product_id' => $produto->id]);

        $result = Order::forUser($licenciado1)->count();
        $this->assertEquals(3, $result);
    }

    public function test_scope_for_user_prestador_retorna_seus_e_pagos_sem_prestador(): void
    {
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $produto    = Product::factory()->create();

        // 2 pedidos vinculados ao prestador1 (qualquer status)
        Order::factory()->emAndamento()->count(2)->create(['prestador' => $prestador1->id, 'product_id' => $produto->id]);
        // 3 pedidos do prestador2 — não deve aparecer
        Order::factory()->emAndamento()->count(3)->create(['prestador' => $prestador2->id, 'product_id' => $produto->id]);
        // 2 pedidos PAGO sem prestador — deve aparecer (pode aceitar)
        Order::factory()->pago()->count(2)->create(['prestador' => null, 'product_id' => $produto->id]);
        // 2 pedidos sem prestador com status diferente de PAGO — não deve aparecer
        Order::factory()->aguardandoPagamento()->count(2)->create(['prestador' => null, 'product_id' => $produto->id]);

        $result = Order::forUser($prestador1)->count();
        // Deve retornar 2 (seus) + 2 (pago sem prestador) = 4
        $this->assertEquals(4, $result);
    }

    // -------------------------------------------------------------------------
    // Status label
    // -------------------------------------------------------------------------

    public function test_status_label_retorna_string_legivel(): void
    {
        $order = Order::factory()->aguardandoPagamento()->create();
        $this->assertEquals('Aguardando pagamento', $order->status_label);
    }
}
