<?php

namespace App\Channels;

use App\Services\WhatsAppService;
use Illuminate\Notifications\Notification;

class WhatsAppChannel
{
    public function __construct(private WhatsAppService $whatsapp) {}

    public function send(mixed $notifiable, Notification $notification): void
    {
        $phone = config('services.whatsapp.admin_phone');

        if (! $phone || ! method_exists($notification, 'toWhatsApp')) {
            return;
        }

        $text = $notification->toWhatsApp($notifiable);

        if (! $text) {
            return;
        }

        $this->whatsapp->send($phone, $text);
    }
}
