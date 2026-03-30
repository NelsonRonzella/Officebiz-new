<?php

namespace App\Notifications;

use App\Channels\WhatsAppChannel;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PedidoAtualizadoNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $pedido;
    public $tipo;

    public function __construct(Order $pedido, $tipo)
    {
        $this->pedido = $pedido;
        $this->tipo = $tipo;
    }

    public function via($notifiable): array
    {
        $channels = ['mail'];

        if (config('services.whatsapp.admin_phone')) {
            $channels[] = WhatsAppChannel::class;
        }

        return $channels;
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Atualização no Pedido #' . $this->pedido->id)
            ->view('emails.notificacao-pedido', [
                'titulo'   => 'Pedido atualizado',
                'mensagem' => 'O pedido recebeu uma atualização.',
                'pedido'   => $this->pedido,
                'extra'    => 'Tipo de alteração:<br><strong>' . $this->tipo . '</strong>',
            ]);
    }

    public function toWhatsApp($notifiable): string
    {
        return "📋 *Pedido atualizado*\n"
            . "Pedido #{$this->pedido->id} — {$this->tipo}\n"
            . "Cliente: {$this->pedido->user->name}";
    }
}