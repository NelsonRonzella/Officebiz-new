<?php

namespace Tests\Unit\Services;

use App\Models\Order;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    private NotificationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(NotificationService::class);
    }

    // -------------------------------------------------------------------------
    // recipientsPedidoCriado
    // -------------------------------------------------------------------------

    public function test_pedido_criado_inclui_admin_cliente_e_licenciado(): void
    {
        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $cliente    = User::factory()->cliente()->create();

        $order = Order::factory()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
        ]);

        // Licenciado é o ator
        $recipients = $this->service->recipientsPedidoCriado($order, $licenciado->id);
        $ids = $recipients->pluck('id')->toArray();

        $this->assertContains($admin->id, $ids);
        $this->assertContains($cliente->id, $ids);
        $this->assertNotContains($licenciado->id, $ids); // ator excluído
    }

    public function test_pedido_criado_nao_inclui_prestador(): void
    {
        $prestador  = User::factory()->prestador()->create();
        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $cliente    = User::factory()->cliente()->create();

        $order = Order::factory()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $recipients = $this->service->recipientsPedidoCriado($order, $admin->id);
        $ids = $recipients->pluck('id')->toArray();

        $this->assertNotContains($prestador->id, $ids);
    }

    // -------------------------------------------------------------------------
    // recipientsMensagem
    // -------------------------------------------------------------------------

    public function test_mensagem_nao_inclui_cliente(): void
    {
        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();
        $cliente    = User::factory()->cliente()->create();

        $order = Order::factory()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $recipients = $this->service->recipientsMensagem($order, $admin->id);
        $ids = $recipients->pluck('id')->toArray();

        $this->assertNotContains($cliente->id, $ids);
        $this->assertContains($licenciado->id, $ids);
        $this->assertContains($prestador->id, $ids);
    }

    public function test_ator_nao_admin_e_excluido_dos_destinatarios(): void
    {
        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();

        $order = Order::factory()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        // Prestador é o ator
        $recipients = $this->service->recipientsMensagem($order, $prestador->id);
        $ids = $recipients->pluck('id')->toArray();

        $this->assertNotContains($prestador->id, $ids);
        $this->assertContains($licenciado->id, $ids);
        $this->assertContains($admin->id, $ids);
    }

    public function test_admin_ator_ainda_recebe_notificacao(): void
    {
        $admin1 = User::factory()->admin()->create();
        $admin2 = User::factory()->admin()->create();

        $order = Order::factory()->create();

        // admin1 é o ator
        $recipients = $this->service->recipientsMensagem($order, $admin1->id);
        $ids = $recipients->pluck('id')->toArray();

        // Admins sempre recebem, mesmo sendo o ator
        $this->assertContains($admin1->id, $ids);
        $this->assertContains($admin2->id, $ids);
    }

    // -------------------------------------------------------------------------
    // recipientsConclusao
    // -------------------------------------------------------------------------

    public function test_conclusao_inclui_todos(): void
    {
        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();
        $cliente    = User::factory()->cliente()->create();

        $order = Order::factory()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        // Admin conclui
        $recipients = $this->service->recipientsConclusao($order, $admin->id);
        $ids = $recipients->pluck('id')->toArray();

        $this->assertContains($cliente->id, $ids);
        $this->assertContains($licenciado->id, $ids);
        $this->assertContains($prestador->id, $ids);
    }

    // -------------------------------------------------------------------------
    // recipientsPrazo
    // -------------------------------------------------------------------------

    public function test_prazo_nao_inclui_cliente(): void
    {
        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();
        $cliente    = User::factory()->cliente()->create();

        $order = Order::factory()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $recipients = $this->service->recipientsPrazo($order);
        $ids = $recipients->pluck('id')->toArray();

        $this->assertNotContains($cliente->id, $ids);
        $this->assertContains($admin->id, $ids);
        $this->assertContains($licenciado->id, $ids);
        $this->assertContains($prestador->id, $ids);
    }

    // -------------------------------------------------------------------------
    // recipientsPrestadorTrocado
    // -------------------------------------------------------------------------

    public function test_prestador_trocado_inclui_novo_prestador(): void
    {
        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();
        $cliente    = User::factory()->cliente()->create();

        $order = Order::factory()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $recipients = $this->service->recipientsPrestadorTrocado($order, $admin->id);
        $ids = $recipients->pluck('id')->toArray();

        $this->assertContains($prestador->id, $ids);
        $this->assertNotContains($cliente->id, $ids);
    }

    // -------------------------------------------------------------------------
    // recipientsEtapaAvancada
    // -------------------------------------------------------------------------

    public function test_etapa_avancada_inclui_todos(): void
    {
        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();
        $cliente    = User::factory()->cliente()->create();

        $order = Order::factory()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $recipients = $this->service->recipientsEtapaAvancada($order, $prestador->id);
        $ids = $recipients->pluck('id')->toArray();

        $this->assertContains($admin->id, $ids);
        $this->assertContains($licenciado->id, $ids);
        $this->assertContains($cliente->id, $ids);
        // Prestador é o ator — não deve receber
        $this->assertNotContains($prestador->id, $ids);
    }
}
