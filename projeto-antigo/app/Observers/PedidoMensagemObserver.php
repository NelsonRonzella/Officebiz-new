<?php

namespace App\Observers;

use App\Models\OrderMessage;
use App\Notifications\PedidoAtualizadoNotification;
use Illuminate\Support\Facades\Notification;

class PedidoMensagemObserver
{

    public function created(OrderMessage $mensagem)
    {
        $pedido = $mensagem->order;

        $emails = [
            config('mail.from.address'),
            $pedido->user->email
        ];

        Notification::route('mail', $emails)
            ->notify(new PedidoAtualizadoNotification($pedido, 'Nova mensagem'));
    }
}