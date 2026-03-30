<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\User;
use App\Notifications\Traits\OrderNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MensagemAdicionadaNotification extends Notification implements ShouldQueue
{
    use Queueable, OrderNotificationChannels;

    public function __construct(
        public Order $order,
        public User $autor,
    ) {}

    public function toDatabase($notifiable): array
    {
        return [
            'pedido_id' => $this->order->id,
            'titulo'    => 'Nova mensagem',
            'mensagem'  => "Pedido #{$this->order->id}: nova mensagem de {$this->autor->name}.",
            'url'       => route('detalhes-pedido', $this->order->id),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Pedido #{$this->order->id} — Nova mensagem")
            ->view('emails.notificacao-pedido', [
                'titulo'   => 'Nova mensagem no pedido',
                'mensagem' => "Uma nova mensagem foi adicionada por {$this->autor->name}.",
                'pedido'   => $this->order,
                'extra'    => null,
            ]);
    }

    public function toWhatsApp($notifiable): string
    {
        return "💬 *Nova mensagem no pedido*\n"
            . "Pedido #{$this->order->id}\n"
            . "Por: {$this->autor->name}";
    }
}
