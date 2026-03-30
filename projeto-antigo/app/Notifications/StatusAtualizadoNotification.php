<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Traits\OrderNotificationChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StatusAtualizadoNotification extends Notification implements ShouldQueue
{
    use Queueable, OrderNotificationChannels;

    public function __construct(public Order $order) {}

    public function toDatabase($notifiable): array
    {
        return [
            'pedido_id' => $this->order->id,
            'titulo'    => 'Status do pedido atualizado',
            'mensagem'  => "Pedido #{$this->order->id}: status alterado para \"{$this->order->status->label()}\".",
            'url'       => route('detalhes-pedido', $this->order->id),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Pedido #{$this->order->id} — Status atualizado")
            ->view('emails.notificacao-pedido', [
                'titulo'   => 'Status do pedido atualizado',
                'mensagem' => "O status do pedido foi alterado para: {$this->order->status->label()}.",
                'pedido'   => $this->order,
                'extra'    => "Novo status: <strong>{$this->order->status->label()}</strong>",
            ]);
    }

    public function toWhatsApp($notifiable): string
    {
        return "🔄 *Status do pedido atualizado*\n"
            . "Pedido #{$this->order->id} — {$this->order->status->label()}\n"
            . "Cliente: {$this->order->user->name}";
    }
}
