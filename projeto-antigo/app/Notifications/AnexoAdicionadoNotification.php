<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Traits\OrderNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AnexoAdicionadoNotification extends Notification implements ShouldQueue
{
    use Queueable, OrderNotificationChannels;

    public function __construct(public Order $order) {}

    public function toDatabase($notifiable): array
    {
        return [
            'pedido_id' => $this->order->id,
            'titulo'    => 'Novo anexo adicionado',
            'mensagem'  => "Pedido #{$this->order->id}: um novo arquivo foi anexado.",
            'url'       => route('detalhes-pedido', $this->order->id),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Pedido #{$this->order->id} — Novo anexo")
            ->view('emails.notificacao-pedido', [
                'titulo'   => 'Novo anexo adicionado',
                'mensagem' => 'Um novo arquivo foi anexado ao pedido.',
                'pedido'   => $this->order,
                'extra'    => null,
            ]);
    }

    public function toWhatsApp($notifiable): string
    {
        return "📎 *Novo anexo adicionado*\n"
            . "Pedido #{$this->order->id}\n"
            . "Cliente: {$this->order->user->name}";
    }
}
