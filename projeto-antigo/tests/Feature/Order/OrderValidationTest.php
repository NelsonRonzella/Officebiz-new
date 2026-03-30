<?php

namespace Tests\Feature\Order;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class OrderValidationTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // StoreOrderRequest
    // -------------------------------------------------------------------------

    public function test_criar_pedido_requer_user_id(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)->post('/pedidos', [
            'product_id' => $product->id,
        ]);

        $response->assertSessionHasErrors('user_id');
    }

    public function test_criar_pedido_requer_product_id(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();

        $response = $this->actingAs($admin)->post('/pedidos', [
            'user_id' => $cliente->id,
        ]);

        $response->assertSessionHasErrors('product_id');
    }

    public function test_criar_pedido_user_id_deve_existir(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)->post('/pedidos', [
            'user_id'    => 99999,
            'product_id' => $product->id,
        ]);

        $response->assertSessionHasErrors('user_id');
    }

    public function test_criar_pedido_product_id_deve_existir(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();

        $response = $this->actingAs($admin)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => 99999,
        ]);

        $response->assertSessionHasErrors('product_id');
    }

    public function test_criar_pedido_sem_nenhum_campo_falha(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/pedidos', []);

        $response->assertSessionHasErrors(['user_id', 'product_id']);
    }

    // -------------------------------------------------------------------------
    // storeMessage
    // -------------------------------------------------------------------------

    public function test_mensagem_requer_campo_mensagem(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = \App\Models\Order::factory()->create();

        $response = $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", []);

        $response->assertSessionHasErrors('mensagem');
    }

    public function test_mensagem_vazia_falha_validacao(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = \App\Models\Order::factory()->create();

        $response = $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => '',
        ]);

        $response->assertSessionHasErrors('mensagem');
    }

    public function test_mensagem_com_texto_valido_passa(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = \App\Models\Order::factory()->create();

        $response = $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Texto válido da mensagem.',
        ]);

        $response->assertSessionMissing('errors');
    }

    // -------------------------------------------------------------------------
    // trocarPrestador — validação de prestador_id
    // -------------------------------------------------------------------------

    public function test_trocar_prestador_com_id_inexistente_falha(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = \App\Models\Order::factory()->create();

        $response = $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", [
            'prestador_id' => 99999,
        ]);

        $response->assertSessionHasErrors('prestador_id');
    }

    public function test_trocar_prestador_com_null_e_valido(): void
    {
        Notification::fake();

        $admin     = User::factory()->admin()->create();
        $prestador = User::factory()->prestador()->create();
        $order     = \App\Models\Order::factory()->create(['prestador' => $prestador->id]);

        $response = $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", [
            'prestador_id' => null,
        ]);

        $response->assertSessionMissing('errors');
    }
}
