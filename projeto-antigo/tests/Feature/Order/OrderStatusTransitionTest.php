<?php

namespace Tests\Feature\Order;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderStatusTransitionTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Transições válidas — happy paths
    // -------------------------------------------------------------------------

    public function test_admin_pode_marcar_pedido_aguardando_como_pago(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->aguardandoPagamento()->create();

        $response = $this->actingAs($admin)->patch("/pedido/{$order->id}/pago");

        $this->assertEquals(OrderStatusEnum::PAGO, $order->fresh()->status);
        $response->assertRedirect();
    }

    public function test_prestador_aceita_pedido_pago_e_fica_em_andamento(): void
    {
        \Illuminate\Support\Facades\Notification::fake();

        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->pago()->create(['prestador' => null]);

        $this->actingAs($prestador)->patch("/pedido/{$order->id}/aceitar");

        $fresh = $order->fresh();
        $this->assertEquals(OrderStatusEnum::EM_ANDAMENTO, $fresh->status);
        $this->assertEquals($prestador->id, $fresh->prestador);
    }

    public function test_admin_pode_marcar_em_andamento_como_retorno(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/retorno");

        $this->assertEquals(OrderStatusEnum::RETORNO, $order->fresh()->status);
    }

    // -------------------------------------------------------------------------
    // Transições inválidas — cancelar
    // -------------------------------------------------------------------------

    public function test_cancelar_pedido_concluido_mantem_status_concluido(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->concluido()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/cancelar");

        $this->assertEquals(OrderStatusEnum::CONCLUIDO, $order->fresh()->status);
    }

    public function test_cancelar_pedido_cancelado_mantem_status_cancelado(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->cancelado()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/cancelar");

        $this->assertEquals(OrderStatusEnum::CANCELADO, $order->fresh()->status);
    }

    public function test_cancelar_retorna_redirect_ao_tentar_cancelar_concluido(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->concluido()->create();

        $response = $this->actingAs($admin)->patch("/pedido/{$order->id}/cancelar");

        // Transição inválida: server redireciona de volta sem mudar status
        $response->assertRedirect();
        $this->assertEquals(OrderStatusEnum::CONCLUIDO, $order->fresh()->status);
    }

    // -------------------------------------------------------------------------
    // Transições inválidas — marcar pago
    // -------------------------------------------------------------------------

    public function test_marcar_pago_pedido_em_andamento_mantem_status(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/pago");

        $this->assertEquals(OrderStatusEnum::EM_ANDAMENTO, $order->fresh()->status);
    }

    public function test_marcar_pago_pedido_concluido_mantem_status(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->concluido()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/pago");

        $this->assertEquals(OrderStatusEnum::CONCLUIDO, $order->fresh()->status);
    }

    public function test_marcar_pago_retorna_redirect_para_transicao_invalida(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();

        $response = $this->actingAs($admin)->patch("/pedido/{$order->id}/pago");

        $response->assertRedirect();
        $this->assertEquals(OrderStatusEnum::EM_ANDAMENTO, $order->fresh()->status);
    }

    // -------------------------------------------------------------------------
    // Transições inválidas — concluir
    // -------------------------------------------------------------------------

    public function test_concluir_pedido_cancelado_mantem_status_cancelado(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->cancelado()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/concluir");

        $this->assertEquals(OrderStatusEnum::CANCELADO, $order->fresh()->status);
    }

    public function test_concluir_pedido_pago_sem_aceite_mantem_status_pago(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->pago()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/concluir");

        $this->assertEquals(OrderStatusEnum::PAGO, $order->fresh()->status);
    }

    // -------------------------------------------------------------------------
    // Transições válidas — retorno
    // -------------------------------------------------------------------------

    public function test_admin_pode_concluir_pedido_em_retorno(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->retorno()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/concluir");

        $this->assertEquals(OrderStatusEnum::CONCLUIDO, $order->fresh()->status);
    }

    public function test_admin_pode_cancelar_pedido_em_retorno(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->retorno()->create();

        $this->actingAs($admin)->patch("/pedido/{$order->id}/cancelar");

        $this->assertEquals(OrderStatusEnum::CANCELADO, $order->fresh()->status);
    }

    // -------------------------------------------------------------------------
    // Controle de acesso — RoleMiddleware redireciona (não retorna 403)
    // -------------------------------------------------------------------------

    public function test_cliente_nao_pode_cancelar_pedido_proprio(): void
    {
        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->aguardandoPagamento()->create(['user_id' => $cliente->id]);

        $response = $this->actingAs($cliente)->patch("/pedido/{$order->id}/cancelar");

        $response->assertRedirect('/pedidos');
    }

    public function test_prestador_nao_pode_cancelar_pedido_de_outro_prestador(): void
    {
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $order      = Order::factory()->emAndamento()->create(['prestador' => $prestador1->id]);

        $response = $this->actingAs($prestador2)->patch("/pedido/{$order->id}/cancelar");

        $response->assertRedirect('/pedidos');
    }

    public function test_licenciado_nao_pode_concluir_pedido(): void
    {
        $licenciado = User::factory()->licenciado()->create();
        $order      = Order::factory()->emAndamento()->create();

        $response = $this->actingAs($licenciado)->patch("/pedido/{$order->id}/concluir");

        $response->assertRedirect('/pedidos');
    }

    // -------------------------------------------------------------------------
    // Troca de prestador
    // -------------------------------------------------------------------------

    public function test_multiplas_trocas_de_prestador_em_sequencia(): void
    {
        $admin      = User::factory()->admin()->create();
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $prestador3 = User::factory()->prestador()->create();
        $order      = Order::factory()->emAndamento()->create(['prestador' => $prestador1->id]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", ['prestador_id' => $prestador2->id]);
        $this->assertEquals($prestador2->id, $order->fresh()->prestador);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", ['prestador_id' => $prestador3->id]);
        $this->assertEquals($prestador3->id, $order->fresh()->prestador);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", ['prestador_id' => $prestador1->id]);
        $this->assertEquals($prestador1->id, $order->fresh()->prestador);
    }

    public function test_remover_prestador_setando_null(): void
    {
        $admin     = User::factory()->admin()->create();
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->emAndamento()->create(['prestador' => $prestador->id]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", ['prestador_id' => null]);

        $this->assertNull($order->fresh()->prestador);
    }
}
