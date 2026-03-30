<?php

namespace Tests\Feature\Order;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Rotas exclusivas de Admin
    // O RoleMiddleware faz redirect('/pedidos') quando o role não tem permissão
    // -------------------------------------------------------------------------

    public function test_cliente_nao_pode_acessar_dashboard_admin(): void
    {
        $cliente = User::factory()->cliente()->create();

        $this->actingAs($cliente)->get('/dashboard')->assertRedirect('/pedidos');
    }

    public function test_licenciado_nao_pode_acessar_dashboard_admin(): void
    {
        $licenciado = User::factory()->licenciado()->create();

        $this->actingAs($licenciado)->get('/dashboard')->assertRedirect('/pedidos');
    }

    public function test_prestador_nao_pode_acessar_dashboard_admin(): void
    {
        $prestador = User::factory()->prestador()->create();

        $this->actingAs($prestador)->get('/dashboard')->assertRedirect('/pedidos');
    }

    public function test_admin_acessa_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/dashboard')->assertOk();
    }

    // -------------------------------------------------------------------------
    // Criação de pedidos restrita a admin e licenciado
    // -------------------------------------------------------------------------

    public function test_cliente_nao_pode_criar_pedido(): void
    {
        $cliente = User::factory()->cliente()->create();
        $outro   = User::factory()->cliente()->create();
        $product = Product::factory()->create();

        $this->actingAs($cliente)->post('/pedidos', [
            'user_id'    => $outro->id,
            'product_id' => $product->id,
        ])->assertRedirect('/pedidos');
    }

    public function test_prestador_nao_pode_criar_pedido(): void
    {
        $prestador = User::factory()->prestador()->create();
        $cliente   = User::factory()->cliente()->create();
        $product   = Product::factory()->create();

        $this->actingAs($prestador)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ])->assertRedirect('/pedidos');
    }

    public function test_cliente_nao_acessa_form_de_novo_pedido(): void
    {
        $cliente = User::factory()->cliente()->create();

        $this->actingAs($cliente)->get('/pedidos/novo')->assertRedirect('/pedidos');
    }

    // -------------------------------------------------------------------------
    // Cancelar / concluir / marcar pago — só admin
    // -------------------------------------------------------------------------

    public function test_licenciado_nao_pode_cancelar_pedido(): void
    {
        $licenciado = User::factory()->licenciado()->create();
        $order      = Order::factory()->aguardandoPagamento()->create();

        $this->actingAs($licenciado)
            ->patch("/pedido/{$order->id}/cancelar")
            ->assertRedirect('/pedidos');
    }

    public function test_prestador_nao_pode_cancelar_pedido(): void
    {
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->aguardandoPagamento()->create();

        $this->actingAs($prestador)
            ->patch("/pedido/{$order->id}/cancelar")
            ->assertRedirect('/pedidos');
    }

    public function test_cliente_nao_pode_cancelar_pedido(): void
    {
        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->aguardandoPagamento()->create();

        $this->actingAs($cliente)
            ->patch("/pedido/{$order->id}/cancelar")
            ->assertRedirect('/pedidos');
    }

    public function test_licenciado_nao_pode_marcar_pago(): void
    {
        $licenciado = User::factory()->licenciado()->create();
        $order      = Order::factory()->aguardandoPagamento()->create();

        $this->actingAs($licenciado)
            ->patch("/pedido/{$order->id}/pago")
            ->assertRedirect('/pedidos');
    }

    public function test_cliente_nao_pode_concluir_pedido(): void
    {
        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->emAndamento()->create();

        $this->actingAs($cliente)
            ->patch("/pedido/{$order->id}/concluir")
            ->assertRedirect('/pedidos');
    }

    // -------------------------------------------------------------------------
    // Aceitar pedido — só prestador
    // -------------------------------------------------------------------------

    public function test_admin_nao_pode_usar_rota_aceitar(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->pago()->create(['prestador' => null]);

        $this->actingAs($admin)
            ->patch("/pedido/{$order->id}/aceitar")
            ->assertRedirect('/pedidos');
    }

    public function test_licenciado_nao_pode_usar_rota_aceitar(): void
    {
        $licenciado = User::factory()->licenciado()->create();
        $order      = Order::factory()->pago()->create(['prestador' => null]);

        $this->actingAs($licenciado)
            ->patch("/pedido/{$order->id}/aceitar")
            ->assertRedirect('/pedidos');
    }

    // -------------------------------------------------------------------------
    // Status via PUT — somente admin (licenciado não pode)
    // -------------------------------------------------------------------------

    public function test_licenciado_nao_pode_atualizar_status_via_put(): void
    {
        $licenciado = User::factory()->licenciado()->create();
        $order      = Order::factory()->aguardandoPagamento()->create(['criado_por' => $licenciado->id]);

        $this->actingAs($licenciado)
            ->put("/pedidos/{$order->id}", ['status' => 'pago'])
            ->assertRedirect('/pedidos');
    }

    // -------------------------------------------------------------------------
    // Clientes — prestador não pode acessar
    // -------------------------------------------------------------------------

    public function test_prestador_nao_pode_listar_clientes(): void
    {
        $prestador = User::factory()->prestador()->create();

        $this->actingAs($prestador)->get('/clientes')->assertRedirect('/pedidos');
    }

    public function test_prestador_nao_pode_acessar_form_cadastrar_cliente(): void
    {
        $prestador = User::factory()->prestador()->create();

        $this->actingAs($prestador)->get('/usuarios/cliente/novo')->assertRedirect('/pedidos');
    }

    public function test_prestador_nao_pode_editar_cliente(): void
    {
        $prestador = User::factory()->prestador()->create();
        $cliente   = User::factory()->cliente()->create();

        $this->actingAs($prestador)->get("/usuarios/{$cliente->id}/editar")->assertRedirect('/pedidos');
    }

    // -------------------------------------------------------------------------
    // Licenciado — acesso a clientes
    // -------------------------------------------------------------------------

    public function test_licenciado_pode_listar_clientes(): void
    {
        $licenciado = User::factory()->licenciado()->create();

        $this->actingAs($licenciado)->get('/clientes')->assertOk();
    }

    public function test_licenciado_acessa_form_cadastrar_cliente(): void
    {
        $licenciado = User::factory()->licenciado()->create();

        $this->actingAs($licenciado)
            ->get('/usuarios/cliente/novo')
            ->assertOk();
    }

    public function test_licenciado_pode_cadastrar_cliente(): void
    {
        $licenciado = User::factory()->licenciado()->create();

        $this->actingAs($licenciado)
            ->post('/clientes', [
                'name'                  => 'Novo Cliente',
                'email'                 => 'novo@cliente.com',
                'password'              => 'senha123',
                'password_confirmation' => 'senha123',
                'telefone'              => '11999999999',
                'role'                  => 'cliente',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'novo@cliente.com']);
    }

    public function test_licenciado_pode_editar_cliente(): void
    {
        $licenciado = User::factory()->licenciado()->create();
        $cliente    = User::factory()->cliente()->create();

        $this->actingAs($licenciado)
            ->get("/usuarios/{$cliente->id}/editar")
            ->assertOk();
    }

    // -------------------------------------------------------------------------
    // Cliente — somente visualização (sem mensagem, anexo ou status)
    // -------------------------------------------------------------------------

    public function test_cliente_nao_pode_enviar_mensagem(): void
    {
        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->create(['user_id' => $cliente->id]);

        $this->actingAs($cliente)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Oi!',
        ])->assertRedirect('/pedidos');
    }

    public function test_cliente_nao_pode_anexar_arquivo(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');

        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->create(['user_id' => $cliente->id]);
        $file    = \Illuminate\Http\UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf');

        $this->actingAs($cliente)
            ->post('/order-attachments', [
                'order_id' => $order->id,
                'files'    => [$file],
            ])
            ->assertRedirect('/pedidos');
    }

    public function test_cliente_nao_pode_alterar_status_do_pedido(): void
    {
        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->aguardandoPagamento()->create(['user_id' => $cliente->id]);

        $this->actingAs($cliente)
            ->put("/pedidos/{$order->id}", ['status' => 'pago'])
            ->assertRedirect('/pedidos');
    }

    public function test_prestador_pode_enviar_mensagem(): void
    {
        Notification::fake();

        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->emAndamento()->create(['prestador' => $prestador->id]);

        $response = $this->actingAs($prestador)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Olá, seguindo em frente.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('order_messages', [
            'order_id' => $order->id,
            'user_id'  => $prestador->id,
        ]);
    }

    // -------------------------------------------------------------------------
    // Avançar etapa — cliente não pode
    // -------------------------------------------------------------------------

    public function test_cliente_nao_pode_avancar_etapa(): void
    {
        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->emAndamento()->create();

        $this->actingAs($cliente)
            ->post("/pedidos/{$order->id}/avancar-etapa")
            ->assertRedirect('/pedidos');
    }

    // -------------------------------------------------------------------------
    // Usuário não autenticado é redirecionado
    // -------------------------------------------------------------------------

    public function test_usuario_nao_autenticado_e_redirecionado_do_pedidos(): void
    {
        $this->get('/pedidos')->assertRedirect('/login');
    }

    public function test_usuario_nao_autenticado_nao_cria_pedido(): void
    {
        $this->post('/pedidos')->assertRedirect('/login');
    }

    // -------------------------------------------------------------------------
    // Troca de prestador — só admin
    // -------------------------------------------------------------------------

    public function test_licenciado_nao_pode_trocar_prestador(): void
    {
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();
        $order      = Order::factory()->create();

        $this->actingAs($licenciado)
            ->patch("/pedido/{$order->id}/prestador", ['prestador_id' => $prestador->id])
            ->assertRedirect('/pedidos');
    }

    public function test_prestador_nao_pode_trocar_prestador(): void
    {
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $order      = Order::factory()->create();

        $this->actingAs($prestador1)
            ->patch("/pedido/{$order->id}/prestador", ['prestador_id' => $prestador2->id])
            ->assertRedirect('/pedidos');
    }
}
