<?php

namespace Tests\Feature\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrderMessageTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Envio de mensagens
    // -------------------------------------------------------------------------

    public function test_admin_pode_enviar_mensagem_em_pedido(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();

        $response = $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Mensagem de teste do admin.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('order_messages', [
            'order_id' => $order->id,
            'user_id'  => $admin->id,
            'message'  => 'Mensagem de teste do admin.',
        ]);
    }

    public function test_licenciado_pode_enviar_mensagem_em_pedido(): void
    {
        Notification::fake();

        $licenciado = User::factory()->licenciado()->create();
        $order      = Order::factory()->create(['criado_por' => $licenciado->id]);

        $response = $this->actingAs($licenciado)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Mensagem do licenciado.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('order_messages', [
            'order_id' => $order->id,
            'user_id'  => $licenciado->id,
        ]);
    }

    public function test_mensagem_vazia_e_rejeitada(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();

        $response = $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => '',
        ]);

        $response->assertSessionHasErrors('mensagem');
        $this->assertDatabaseMissing('order_messages', ['order_id' => $order->id]);
    }

    public function test_mensagem_sem_campo_e_rejeitada(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();

        $response = $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", []);

        $response->assertSessionHasErrors('mensagem');
    }

    // -------------------------------------------------------------------------
    // Mensagem com arquivo
    // -------------------------------------------------------------------------

    public function test_mensagem_com_arquivo_e_salva_corretamente(): void
    {
        Notification::fake();
        Storage::fake('local');

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();

        $file = UploadedFile::fake()->create('documento.pdf', 500, 'application/pdf');

        $response = $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Segue o arquivo.',
            'file'     => $file,
        ]);

        $response->assertRedirect();

        $message = $order->messages()->latest()->first();
        $this->assertNotNull($message->file);
    }

    public function test_arquivo_invalido_muito_grande_e_rejeitado(): void
    {
        Notification::fake();
        Storage::fake('local');

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();

        // max é 10000 KB = ~10MB; criamos um arquivo de 11MB
        $file = UploadedFile::fake()->create('enorme.pdf', 11001, 'application/pdf');

        $response = $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Arquivo muito grande.',
            'file'     => $file,
        ]);

        $response->assertSessionHasErrors('file');
    }

    // -------------------------------------------------------------------------
    // Mensagem inicial ao criar pedido
    // -------------------------------------------------------------------------

    public function test_mensagem_inicial_e_salva_ao_criar_pedido(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();
        $product = \App\Models\Product::factory()->create();

        $this->actingAs($admin)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
            'message'    => 'Observação inicial do pedido.',
        ]);

        $order = \App\Models\Order::latest()->first();

        $this->assertDatabaseHas('order_messages', [
            'order_id' => $order->id,
            'user_id'  => $admin->id,
            'message'  => 'Observação inicial do pedido.',
        ]);
    }

    public function test_sem_mensagem_inicial_nao_cria_mensagem(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();
        $product = \App\Models\Product::factory()->create();

        $this->actingAs($admin)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ]);

        $order = \App\Models\Order::latest()->first();

        $this->assertDatabaseMissing('order_messages', ['order_id' => $order->id]);
    }

    // -------------------------------------------------------------------------
    // Pedido cancelado — bloquear mensagens e anexos
    // -------------------------------------------------------------------------

    public function test_nao_pode_enviar_mensagem_em_pedido_cancelado(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->cancelado()->create();

        $response = $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Tentativa em pedido cancelado.',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('order_messages', ['order_id' => $order->id]);
    }

    public function test_nao_pode_enviar_anexo_em_pedido_cancelado(): void
    {
        Notification::fake();
        \Illuminate\Support\Facades\Storage::fake('local');

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->cancelado()->create();

        $file = \Illuminate\Http\UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf');

        $response = $this->actingAs($admin)->post('/order-attachments', [
            'order_id' => $order->id,
            'files'    => [$file],
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('order_attachments', ['order_id' => $order->id]);
    }

    // -------------------------------------------------------------------------
    // AJAX
    // -------------------------------------------------------------------------

    public function test_envio_de_mensagem_via_ajax_retorna_json(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();

        $response = $this->actingAs($admin)
            ->withHeaders(['X-Requested-With' => 'XMLHttpRequest'])
            ->post("/pedidos/{$order->id}/mensagem", [
                'mensagem' => 'Mensagem AJAX.',
            ]);

        $response->assertOk()
            ->assertJson(['message' => 'Mensagem enviada com sucesso!']);
    }
}
