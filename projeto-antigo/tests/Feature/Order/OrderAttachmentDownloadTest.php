<?php

namespace Tests\Feature\Order;

use App\Models\Order;
use App\Models\OrderAttachment;
use App\Models\OrderMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrderAttachmentDownloadTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private function criarPedidoComAnexo(array $orderOverrides = []): array
    {
        Storage::fake();

        $admin  = User::factory()->admin()->create();
        $order  = Order::factory()->emAndamento()->create($orderOverrides);
        $file   = UploadedFile::fake()->create('test.pdf', 100);
        $path   = $file->store('orders/' . $order->id);

        $attachment = OrderAttachment::create([
            'order_id' => $order->id,
            'file'     => $path,
        ]);

        return compact('admin', 'order', 'attachment');
    }

    // -------------------------------------------------------------------------
    // Acesso autorizado
    // -------------------------------------------------------------------------

    public function test_admin_faz_download_de_anexo(): void
    {
        [
            'admin'      => $admin,
            'attachment' => $attachment,
        ] = $this->criarPedidoComAnexo();

        $response = $this->actingAs($admin)->get("/order-attachments/{$attachment->id}/download");

        $response->assertOk();
    }

    public function test_admin_download_retorna_header_content_disposition(): void
    {
        [
            'admin'      => $admin,
            'attachment' => $attachment,
        ] = $this->criarPedidoComAnexo();

        $response = $this->actingAs($admin)->get("/order-attachments/{$attachment->id}/download");

        $response->assertOk();
        $this->assertStringContainsString(
            'attachment',
            $response->headers->get('Content-Disposition', '')
        );
    }

    public function test_cliente_dono_do_pedido_faz_download(): void
    {
        Storage::fake();

        $cliente = User::factory()->cliente()->create();
        $order   = Order::factory()->emAndamento()->create(['user_id' => $cliente->id]);
        $path    = UploadedFile::fake()->create('test.pdf', 100)->store('orders/' . $order->id);

        $attachment = OrderAttachment::create(['order_id' => $order->id, 'file' => $path]);

        $this->actingAs($cliente)->get("/order-attachments/{$attachment->id}/download")->assertOk();
    }

    public function test_prestador_vinculado_ao_pedido_faz_download(): void
    {
        Storage::fake();

        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->emAndamento()->create(['prestador' => $prestador->id]);
        $path      = UploadedFile::fake()->create('test.pdf', 100)->store('orders/' . $order->id);

        $attachment = OrderAttachment::create(['order_id' => $order->id, 'file' => $path]);

        $this->actingAs($prestador)->get("/order-attachments/{$attachment->id}/download")->assertOk();
    }

    public function test_licenciado_criador_do_pedido_faz_download(): void
    {
        Storage::fake();

        $licenciado = User::factory()->licenciado()->create();
        $order      = Order::factory()->emAndamento()->create(['criado_por' => $licenciado->id]);
        $path       = UploadedFile::fake()->create('test.pdf', 100)->store('orders/' . $order->id);

        $attachment = OrderAttachment::create(['order_id' => $order->id, 'file' => $path]);

        $this->actingAs($licenciado)->get("/order-attachments/{$attachment->id}/download")->assertOk();
    }

    // -------------------------------------------------------------------------
    // Acesso negado (403)
    // -------------------------------------------------------------------------

    public function test_cliente_sem_pedido_nao_acessa_download(): void
    {
        ['attachment' => $attachment] = $this->criarPedidoComAnexo();

        $outro = User::factory()->cliente()->create();

        $this->actingAs($outro)
            ->get("/order-attachments/{$attachment->id}/download")
            ->assertForbidden();
    }

    public function test_prestador_nao_vinculado_nao_acessa_download(): void
    {
        ['attachment' => $attachment] = $this->criarPedidoComAnexo();

        $outro = User::factory()->prestador()->create();

        $this->actingAs($outro)
            ->get("/order-attachments/{$attachment->id}/download")
            ->assertForbidden();
    }

    public function test_licenciado_nao_criador_do_pedido_nao_acessa_download(): void
    {
        ['attachment' => $attachment] = $this->criarPedidoComAnexo();

        $outro = User::factory()->licenciado()->create();

        $this->actingAs($outro)
            ->get("/order-attachments/{$attachment->id}/download")
            ->assertForbidden();
    }

    // -------------------------------------------------------------------------
    // Não autenticado
    // -------------------------------------------------------------------------

    public function test_usuario_nao_autenticado_e_redirecionado(): void
    {
        ['attachment' => $attachment] = $this->criarPedidoComAnexo();

        $this->get("/order-attachments/{$attachment->id}/download")->assertRedirect();
    }

    // -------------------------------------------------------------------------
    // Arquivo não existe no storage
    // -------------------------------------------------------------------------

    public function test_arquivo_inexistente_no_storage_retorna_404(): void
    {
        Storage::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();

        $attachment = OrderAttachment::create([
            'order_id' => $order->id,
            'file'     => 'orders/inexistente/arquivo-que-nao-existe.pdf',
        ]);

        $this->actingAs($admin)
            ->get("/order-attachments/{$attachment->id}/download")
            ->assertNotFound();
    }

    // -------------------------------------------------------------------------
    // Download de mensagem com arquivo
    // -------------------------------------------------------------------------

    public function test_download_de_mensagem_com_arquivo(): void
    {
        Storage::fake();

        $admin = User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();
        $path  = UploadedFile::fake()->create('mensagem.pdf', 100)->store('orders/' . $order->id);

        $msg = OrderMessage::create([
            'order_id' => $order->id,
            'user_id'  => $admin->id,
            'message'  => 'test',
            'date'     => now(),
            'file'     => $path,
        ]);

        $this->actingAs($admin)
            ->get("/order-messages/{$msg->id}/download")
            ->assertOk();
    }
}
