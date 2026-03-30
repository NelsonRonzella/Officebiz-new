<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\OrderStep;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class EtapaAvancadaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order,
        public OrderStep $step,
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'pedido_id' => $this->order->id,
            'titulo'    => 'Etapa avançada',
            'mensagem'  => "Pedido #{$this->order->id}: etapa \"{$this->step->title}\" foi iniciada.",
            'url'       => route('detalhes-pedido', $this->order->id),
        ];
    }
}
