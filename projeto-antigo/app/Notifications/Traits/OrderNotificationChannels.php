<?php

namespace App\Notifications\Traits;

use App\Channels\WhatsAppChannel;
use App\Models\User;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

trait OrderNotificationChannels
{
    public function via($notifiable): array
    {
        // WebPush e database só funcionam em usuários reais (com a trait Notifiable).
        // Notifiables anônimos (ex.: Notification::route('mail', ...)) não suportam esses canais.
        if ($notifiable instanceof \App\Models\User) {
            $channels = ['database', WebPushChannel::class];
        } else {
            $channels = [];
        }

        if ($this->shouldSendMail($notifiable)) {
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

    protected function shouldSendMail($notifiable): bool
    {
        return $notifiable instanceof User
            && in_array($notifiable->role, [User::LICENCIADO, User::PRESTADOR]);
    }
}
