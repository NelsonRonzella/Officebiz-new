<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class PrestadorVinculadoNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $pedido) {}

    public function via($notifiable): array
    {
        return ['database', 'mail', WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification): WebPushMessage
    {
        $data = $this->toDatabase($notifiable);

        return (new WebPushMessage)
            ->title($data['titulo'])
            ->body($data['mensagem'])
            ->icon('/icons/web-app-manifest-192x192.png')
            ->data(['url' => $data['url']]);
    }

    public function toMail($notifiable): MailMessage
    {
        $isPrestador = $notifiable->role === \App\Models\User::PRESTADOR;

        $titulo   = $isPrestador
            ? 'Você foi vinculado a um pedido'
            : 'Prestador vinculado a um pedido';

        $mensagem = $isPrestador
            ? 'Você foi atribuído como prestador responsável por um pedido.'
            : "Um prestador foi vinculado ao pedido #{$this->pedido->id}.";

        return (new MailMessage)
            ->subject("Pedido #{$this->pedido->id} — {$titulo}")
            ->view('emails.notificacao-pedido', [
                'titulo'   => $titulo,
                'mensagem' => $mensagem,
                'pedido'   => $this->pedido,
                'extra'    => 'Produto: <strong>' . $this->pedido->product->name . '</strong>',
            ]);
    }

    public function toDatabase($notifiable): array
    {
        $isPrestador = $notifiable->role === \App\Models\User::PRESTADOR;

        return [
            'pedido_id' => $this->pedido->id,
            'titulo'    => $isPrestador ? 'Você foi vinculado a um pedido' : 'Prestador vinculado a um pedido',
            'mensagem'  => $isPrestador
                ? "Você foi atribuído como prestador do pedido #{$this->pedido->id} — {$this->pedido->product->name}."
                : "Um prestador foi vinculado ao pedido #{$this->pedido->id} — {$this->pedido->product->name}.",
            'url'       => route('detalhes-pedido', $this->pedido->id),
        ];
    }
}
