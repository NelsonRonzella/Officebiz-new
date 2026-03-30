<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    public function send(string $phone, string $text): void
    {
        $url      = config('services.whatsapp.url');
        $instance = config('services.whatsapp.instance');
        $token    = config('services.whatsapp.token');

        if (! $url || ! $instance || ! $token) {
            return;
        }

        try {
            Http::withHeaders(['apikey' => $token])
                ->post("{$url}/message/sendText/{$instance}", [
                    'number' => $phone,
                    'text'   => $text,
                ]);
        } catch (\Throwable $e) {
            Log::error('WhatsApp: falha ao enviar mensagem', [
                'phone'   => $phone,
                'error'   => $e->getMessage(),
            ]);
        }
    }
}
