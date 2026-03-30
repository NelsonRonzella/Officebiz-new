<?php

namespace App\Notifications;

use App\Channels\WhatsAppChannel;
use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class PedidoConcluidoNotification extends Notification implements ShouldQueue
{
    use Queueable;
    public function __construct(public Order $order) {}

    public function via($notifiable): array
    {
        $channels = ['database', WebPushChannel::class];

        if ($notifiable instanceof User && in_array($notifiable->role, [
            User::LICENCIADO, User::PRESTADOR, User::CLIENTE,
        ])) {
            $channels[] = 'mail';
        }

        if (config('services.whatsapp.admin_phone')) {
            $channels[] = WhatsAppChannel::class;
        }

        return $channels;
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

    public function toDatabase($notifiable): array
    {
        return [
            'pedido_id' => $this->order->id,
            'titulo'    => 'Pedido concluído',
            'mensagem'  => "Pedido #{$this->order->id} — {$this->order->product->name} foi concluído.",
            'url'       => route('detalhes-pedido', $this->order->id),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Pedido #{$this->order->id} — Concluído")
            ->view('emails.notificacao-pedido', [
                'titulo'   => 'Pedido concluído',
                'mensagem' => "O pedido #{$this->order->id} foi concluído com sucesso.",
                'pedido'   => $this->order,
                'extra'    => 'Produto: <strong>' . $this->order->product->name . '</strong>',
            ]);
    }

    public function toWhatsApp($notifiable): string
    {
        return "✅ *Pedido concluído*\n"
            . "Pedido #{$this->order->id} — {$this->order->product->name}\n"
            . "Cliente: {$this->order->user->name}";
    }
}
