<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Traits\OrderNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PedidoCriadoNotification extends Notification implements ShouldQueue
{
    use Queueable, OrderNotificationChannels;

    public function __construct(public Order $pedido) {}

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Pedido #{$this->pedido->id} — Novo pedido criado")
            ->view('emails.notificacao-pedido', [
                'titulo'   => 'Novo pedido criado',
                'mensagem' => 'Um novo pedido foi criado e está vinculado a você.',
                'pedido'   => $this->pedido,
                'extra'    => 'Produto: <strong>' . $this->pedido->product->name . '</strong>',
            ]);
    }

    public function toDatabase($notifiable): array
    {
        return [
            'pedido_id' => $this->pedido->id,
            'titulo'    => 'Novo pedido criado',
            'mensagem'  => "Pedido #{$this->pedido->id} — {$this->pedido->product->name} foi criado.",
            'url'       => route('detalhes-pedido', $this->pedido->id),
        ];
    }

    public function toWhatsApp($notifiable): string
    {
        return "🆕 *Novo pedido criado*\n"
            . "Pedido #{$this->pedido->id} — {$this->pedido->product->name}\n"
            . "Cliente: {$this->pedido->user->name}";
    }
}
