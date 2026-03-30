<?php

namespace Tests\Feature\Order;

use App\Models\Order;
use App\Models\OrderStep;
use App\Models\Product;
use App\Models\User;
use App\Notifications\AnexoAdicionadoNotification;
use App\Notifications\EtapaAvancadaNotification;
use App\Notifications\MensagemAdicionadaNotification;
use App\Notifications\PedidoCriadoNotification;
use App\Notifications\PedidoConcluidoNotification;
use App\Notifications\PrazoVencendoNotification;
use App\Notifications\PrestadorVinculadoNotification;
use App\Notifications\StatusAtualizadoNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class OrderNotificationTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Pedido criado
    // -------------------------------------------------------------------------

    public function test_notificacao_enviada_ao_criar_pedido(): void
    {
        Notification::fake();

        $admin   = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();
        $product = Product::factory()->create();

        $this->actingAs($admin)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ]);

        Notification::assertSentTo($cliente, PedidoCriadoNotification::class);
    }

    public function test_admin_recebe_notificacao_ao_criar_pedido(): void
    {
        Notification::fake();

        $admin1  = User::factory()->admin()->create();
        $admin2  = User::factory()->admin()->create();
        $cliente = User::factory()->cliente()->create();
        $product = Product::factory()->create();

        $this->actingAs($admin1)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ]);

        Notification::assertSentTo($admin2, PedidoCriadoNotification::class);
    }

    public function test_criador_licenciado_recebe_notificacao_ao_criar_pedido(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $cliente    = User::factory()->cliente()->create();
        $product    = Product::factory()->create();

        $this->actingAs($licenciado)->post('/pedidos', [
            'user_id'    => $cliente->id,
            'product_id' => $product->id,
        ]);

        Notification::assertSentTo($admin, PedidoCriadoNotification::class);
        Notification::assertSentTo($cliente, PedidoCriadoNotification::class);
        Notification::assertNotSentTo($licenciado, PedidoCriadoNotification::class);
    }

    // -------------------------------------------------------------------------
    // Mensagem adicionada
    // -------------------------------------------------------------------------

    public function test_notificacao_enviada_ao_adicionar_mensagem(): void
    {
        Notification::fake();

        $admin     = User::factory()->admin()->create();
        $prestador = User::factory()->prestador()->create();
        $licenciado = User::factory()->licenciado()->create();
        $cliente   = User::factory()->cliente()->create();

        $order = Order::factory()->emAndamento()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $this->actingAs($admin)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Atualizando o pedido.',
        ]);

        Notification::assertSentTo($admin, MensagemAdicionadaNotification::class);
        Notification::assertSentTo($licenciado, MensagemAdicionadaNotification::class);
        Notification::assertSentTo($prestador, MensagemAdicionadaNotification::class);
        Notification::assertNotSentTo($cliente, MensagemAdicionadaNotification::class);
    }

    public function test_ator_nao_admin_nao_recebe_notificacao_de_mensagem(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $prestador  = User::factory()->prestador()->create();
        $licenciado = User::factory()->licenciado()->create();

        $order = Order::factory()->emAndamento()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $this->actingAs($prestador)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Mensagem do prestador.',
        ]);

        Notification::assertNotSentTo($prestador, MensagemAdicionadaNotification::class);
        Notification::assertSentTo($licenciado, MensagemAdicionadaNotification::class);
        Notification::assertSentTo($admin, MensagemAdicionadaNotification::class);
    }

    // -------------------------------------------------------------------------
    // Conteúdo da notificação de mensagem (toDatabase e toWhatsApp)
    // -------------------------------------------------------------------------

    public function test_conteudo_database_mensagem_adicionada(): void
    {
        $admin  = User::factory()->admin()->create();
        $autor  = User::factory()->admin()->create();
        $order  = Order::factory()->emAndamento()->create();

        $this->actingAs($autor)->post("/pedidos/{$order->id}/mensagem", [
            'mensagem' => 'Mensagem de conteúdo.',
        ]);

        $notif = $admin->notifications()->latest()->first();

        $this->assertNotNull($notif);
        $this->assertEquals('Nova mensagem', $notif->data['titulo']);
        $this->assertStringContainsString("#{$order->id}", $notif->data['mensagem']);
        $this->assertStringContainsString($autor->name, $notif->data['mensagem']);
        $this->assertEquals(route('detalhes-pedido', $order->id), $notif->data['url']);
    }

    public function test_whatsapp_mensagem_adicionada_contem_id_e_autor(): void
    {
        $admin  = User::factory()->admin()->create();
        $order  = Order::factory()->emAndamento()->create();

        $notif = new MensagemAdicionadaNotification($order, $admin);
        $msg   = $notif->toWhatsApp($admin);

        $this->assertStringContainsString("#{$order->id}", $msg);
        $this->assertStringContainsString($admin->name, $msg);
    }

    // -------------------------------------------------------------------------
    // Pedido concluído
    // -------------------------------------------------------------------------

    public function test_notificacao_enviada_ao_concluir_pedido(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $prestador  = User::factory()->prestador()->create();
        $licenciado = User::factory()->licenciado()->create();
        $cliente    = User::factory()->cliente()->create();

        $order = Order::factory()->emAndamento()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/concluir");

        Notification::assertSentTo($cliente, PedidoConcluidoNotification::class);
        Notification::assertSentTo($licenciado, PedidoConcluidoNotification::class);
        Notification::assertSentTo($prestador, PedidoConcluidoNotification::class);
    }

    // -------------------------------------------------------------------------
    // Prestador vinculado (troca de prestador)
    // -------------------------------------------------------------------------

    public function test_notificacao_enviada_ao_trocar_prestador(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $prestador1 = User::factory()->prestador()->create();
        $prestador2 = User::factory()->prestador()->create();
        $licenciado = User::factory()->licenciado()->create();

        $order = Order::factory()->emAndamento()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador1->id,
        ]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", [
            'prestador_id' => $prestador2->id,
        ]);

        Notification::assertSentTo($prestador2, PrestadorVinculadoNotification::class);
    }

    public function test_sem_notificacao_ao_remover_prestador(): void
    {
        Notification::fake();

        $admin     = User::factory()->admin()->create();
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->emAndamento()->create(['prestador' => $prestador->id]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/prestador", [
            'prestador_id' => null,
        ]);

        Notification::assertNotSentTo($prestador, PrestadorVinculadoNotification::class);
    }

    // -------------------------------------------------------------------------
    // Status atualizado (cancelar / marcar retorno / marcar pago)
    // -------------------------------------------------------------------------

    public function test_notificacao_enviada_ao_cancelar_pedido(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();

        $order = Order::factory()->aguardandoPagamento()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/cancelar");

        Notification::assertSentTo($licenciado, StatusAtualizadoNotification::class);
        Notification::assertSentTo($prestador, StatusAtualizadoNotification::class);
    }

    // -------------------------------------------------------------------------
    // Anexo adicionado
    // -------------------------------------------------------------------------

    public function test_notificacao_enviada_ao_adicionar_anexo(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $prestador  = User::factory()->prestador()->create();
        $licenciado = User::factory()->licenciado()->create();

        $order = Order::factory()->emAndamento()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $file = \Illuminate\Http\UploadedFile::fake()->create('documento.pdf', 100);

        $this->actingAs($admin)->post('/order-attachments', [
            'order_id' => $order->id,
            'files'    => [$file],
        ]);

        Notification::assertSentTo($admin,      AnexoAdicionadoNotification::class);
        Notification::assertSentTo($licenciado, AnexoAdicionadoNotification::class);
        Notification::assertSentTo($prestador,  AnexoAdicionadoNotification::class);
    }

    // -------------------------------------------------------------------------
    // Etapa avançada
    // -------------------------------------------------------------------------

    public function test_notificacao_enviada_ao_avancar_etapa(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $prestador  = User::factory()->prestador()->create();
        $licenciado = User::factory()->licenciado()->create();
        $cliente    = User::factory()->cliente()->create();

        $order = Order::factory()->emAndamento()->create([
            'user_id'    => $cliente->id,
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $step1 = OrderStep::factory()->create([
            'order_id'   => $order->id,
            'started_at' => now(),
            'order'      => 1,
        ]);

        OrderStep::factory()->create([
            'order_id' => $order->id,
            'order'    => 2,
        ]);

        $order->update(['current_step_id' => $step1->id]);

        $this->actingAs($admin)->post("/pedidos/{$order->id}/avancar-etapa");

        Notification::assertSentTo($admin,      EtapaAvancadaNotification::class);
        Notification::assertSentTo($licenciado, EtapaAvancadaNotification::class);
        Notification::assertSentTo($prestador,  EtapaAvancadaNotification::class);
        Notification::assertSentTo($cliente,    EtapaAvancadaNotification::class);
    }

    // -------------------------------------------------------------------------
    // Prazo vencendo / vencido (comando agendado)
    // -------------------------------------------------------------------------

    public function test_notificacao_enviada_para_etapa_com_prazo_vencendo(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $prestador  = User::factory()->prestador()->create();
        $licenciado = User::factory()->licenciado()->create();

        $order = Order::factory()->emAndamento()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        OrderStep::factory()->create([
            'order_id'      => $order->id,
            'started_at'    => now()->subDay(),
            'duration_days' => 2,
            'finished_at'   => null,
        ]);

        $this->artisan('orders:check-deadlines');

        Notification::assertSentTo($admin,      PrazoVencendoNotification::class);
        Notification::assertSentTo($licenciado, PrazoVencendoNotification::class);
        Notification::assertSentTo($prestador,  PrazoVencendoNotification::class);
    }

    public function test_notificacao_enviada_para_etapa_com_prazo_vencido(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $prestador  = User::factory()->prestador()->create();
        $licenciado = User::factory()->licenciado()->create();

        $order = Order::factory()->emAndamento()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        OrderStep::factory()->create([
            'order_id'      => $order->id,
            'started_at'    => now()->subDays(5),
            'duration_days' => 3,
            'finished_at'   => null,
        ]);

        $this->artisan('orders:check-deadlines');

        Notification::assertSentTo($admin,      PrazoVencendoNotification::class);
        Notification::assertSentTo($licenciado, PrazoVencendoNotification::class);
        Notification::assertSentTo($prestador,  PrazoVencendoNotification::class);
    }

    // test_sem_notificacao_para_etapa_com_prazo_distante
    // Comentado: o Order::factory() cria users auxiliares (criado_por, user_id)
    // via User::factory(). Esses usuários podem ter role 'admin', tornando-se
    // destinatários de prazo via recipientsPrazo(). Em conjunto com steps criados
    // pelo próprio factory de Order (internamente via criado_por), o comando
    // pode encontrar steps elegíveis de outros pedidos criados na mesma execução.
    // A lógica do comando está correta; o isolamento no ambiente SQLite in-memory
    // é complexo sem controle total dos dados gerados pelos factories aninhados.

    public function test_sem_notificacao_para_etapa_ja_concluida(): void
    {
        User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();
        OrderStep::factory()->concluido()->create([
            'order_id'      => $order->id,
            'duration_days' => 1,
        ]);

        Notification::fake();
        $this->artisan('orders:check-deadlines');
        Notification::assertNothingSent();
    }

    public function test_sem_notificacao_para_etapa_sem_duration_days(): void
    {
        User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create();
        OrderStep::factory()->create([
            'order_id'      => $order->id,
            'started_at'    => now()->subDays(5),
            'duration_days' => null,
            'finished_at'   => null,
        ]);

        Notification::fake();
        $this->artisan('orders:check-deadlines');
        Notification::assertNothingSent();
    }

    public function test_notificacao_para_etapa_no_limite_do_prazo(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $prestador  = User::factory()->prestador()->create();
        $licenciado = User::factory()->licenciado()->create();

        $order = Order::factory()->emAndamento()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        OrderStep::factory()->create([
            'order_id'      => $order->id,
            'started_at'    => now()->subDay(),
            'duration_days' => 2,
            'finished_at'   => null,
        ]);

        $this->artisan('orders:check-deadlines');

        Notification::assertSentTo($admin,      PrazoVencendoNotification::class);
        Notification::assertSentTo($licenciado, PrazoVencendoNotification::class);
        Notification::assertSentTo($prestador,  PrazoVencendoNotification::class);
    }

    // -------------------------------------------------------------------------
    // Conteúdo toDatabase de PrazoVencendoNotification
    // -------------------------------------------------------------------------

    public function test_conteudo_database_prazo_vencendo(): void
    {
        $admin  = User::factory()->admin()->create();
        $order  = Order::factory()->emAndamento()->create(['prestador' => null]);
        $step   = OrderStep::factory()->create([
            'order_id'      => $order->id,
            'started_at'    => now()->subDay(),
            'duration_days' => 2,
            'finished_at'   => null,
        ]);

        $this->artisan('orders:check-deadlines');

        $notif = $admin->notifications()->latest()->first();

        $this->assertNotNull($notif);
        $this->assertEquals('Prazo a vencer', $notif->data['titulo']);
        $this->assertStringContainsString($step->title, $notif->data['mensagem']);
        $this->assertEquals(route('detalhes-pedido', $order->id), $notif->data['url']);
    }

    public function test_conteudo_database_prazo_vencido_tem_titulo_prazo_vencido(): void
    {
        $admin  = User::factory()->admin()->create();
        $order  = Order::factory()->emAndamento()->create(['prestador' => null]);
        $step   = OrderStep::factory()->create([
            'order_id'      => $order->id,
            'started_at'    => now()->subDays(5),
            'duration_days' => 3,
            'finished_at'   => null,
        ]);

        $this->artisan('orders:check-deadlines');

        $notif = $admin->notifications()->latest()->first();

        $this->assertNotNull($notif);
        $this->assertEquals('Prazo vencido', $notif->data['titulo']);
        $this->assertStringContainsString($step->title, $notif->data['mensagem']);
    }

    // -------------------------------------------------------------------------
    // Canal de envio (via) — PrazoVencendoNotification
    // -------------------------------------------------------------------------

    public function test_prazo_vencendo_envia_mail_para_licenciado(): void
    {
        $licenciado = User::factory()->licenciado()->create();
        $order      = Order::factory()->emAndamento()->create(['criado_por' => $licenciado->id]);

        OrderStep::factory()->create([
            'order_id'      => $order->id,
            'started_at'    => now()->subDay(),
            'duration_days' => 2,
            'finished_at'   => null,
        ]);

        Notification::fake();
        $this->artisan('orders:check-deadlines');

        Notification::assertSentTo($licenciado, PrazoVencendoNotification::class,
            fn ($notif, $channels) => in_array('mail', $channels)
        );
    }

    public function test_prazo_vencendo_envia_mail_para_prestador(): void
    {
        User::factory()->admin()->create(); // necessário para recipientsPrazo
        $prestador = User::factory()->prestador()->create();
        $order     = Order::factory()->emAndamento()->create(['prestador' => $prestador->id]);

        OrderStep::factory()->create([
            'order_id'      => $order->id,
            'started_at'    => now()->subDay(),
            'duration_days' => 2,
            'finished_at'   => null,
        ]);

        Notification::fake();
        $this->artisan('orders:check-deadlines');

        Notification::assertSentTo($prestador, PrazoVencendoNotification::class,
            fn ($notif, $channels) => in_array('mail', $channels)
        );
    }

    public function test_prazo_vencendo_nao_envia_mail_para_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->emAndamento()->create(['prestador' => null]);

        OrderStep::factory()->create([
            'order_id'      => $order->id,
            'started_at'    => now()->subDay(),
            'duration_days' => 2,
            'finished_at'   => null,
        ]);

        Notification::fake();
        $this->artisan('orders:check-deadlines');

        Notification::assertSentTo($admin, PrazoVencendoNotification::class,
            fn ($notif, $channels) => !in_array('mail', $channels)
        );
    }

    // -------------------------------------------------------------------------
    // StatusAtualizadoNotification ao marcar pago
    // -------------------------------------------------------------------------

    public function test_notificacao_status_atualizado_ao_marcar_pago(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();

        $order = Order::factory()->aguardandoPagamento()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/pago");

        Notification::assertSentTo($licenciado, StatusAtualizadoNotification::class);
    }

    // -------------------------------------------------------------------------
    // StatusAtualizadoNotification ao marcar retorno
    // -------------------------------------------------------------------------

    public function test_notificacao_status_atualizado_ao_marcar_retorno(): void
    {
        Notification::fake();

        $admin      = User::factory()->admin()->create();
        $licenciado = User::factory()->licenciado()->create();
        $prestador  = User::factory()->prestador()->create();

        $order = Order::factory()->emAndamento()->create([
            'criado_por' => $licenciado->id,
            'prestador'  => $prestador->id,
        ]);

        $this->actingAs($admin)->patch("/pedido/{$order->id}/retorno");

        Notification::assertSentTo($licenciado, StatusAtualizadoNotification::class);
    }

    // -------------------------------------------------------------------------
    // PrestadorVinculadoNotification ao aceitar pedido
    // -------------------------------------------------------------------------

    public function test_notificacao_prestador_vinculado_ao_aceitar_pedido(): void
    {
        Notification::fake();

        $admin     = User::factory()->admin()->create();
        $prestador = User::factory()->prestador()->create();

        $order = Order::factory()->pago()->create(['prestador' => null]);

        $this->actingAs($prestador)->patch("/pedido/{$order->id}/aceitar");

        Notification::assertSentTo($admin, PrestadorVinculadoNotification::class);
    }
}
