<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\OrderStep;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class PrazoVencendoNotification extends Notification implements ShouldQueue
{
    use Queueable;
    public function __construct(
        public Order $order,
        public OrderStep $step,
        public bool $vencido = false,
    ) {}

    public function via($notifiable): array
    {
        $channels = ['database', WebPushChannel::class];

        if ($notifiable instanceof User && in_array($notifiable->role, [User::LICENCIADO, User::PRESTADOR])) {
            $channels[] = 'mail';
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
            'titulo'    => $this->vencido ? 'Prazo vencido' : 'Prazo a vencer',
            'mensagem'  => $this->vencido
                ? "Pedido #{$this->order->id}: etapa \"{$this->step->title}\" está com o prazo vencido."
                : "Pedido #{$this->order->id}: etapa \"{$this->step->title}\" vence em breve.",
            'url'       => route('detalhes-pedido', $this->order->id),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $titulo   = $this->vencido ? 'Prazo vencido' : 'Prazo a vencer';
        $mensagem = $this->vencido
            ? "A etapa \"{$this->step->title}\" está com o prazo vencido."
            : "A etapa \"{$this->step->title}\" está próxima do vencimento.";

        return (new MailMessage)
            ->subject("Pedido #{$this->order->id} — {$titulo}")
            ->view('emails.notificacao-pedido', [
                'titulo'   => $titulo,
                'mensagem' => $mensagem,
                'pedido'   => $this->order,
                'extra'    => "Etapa: <strong>{$this->step->title}</strong>",
            ]);
    }
}
