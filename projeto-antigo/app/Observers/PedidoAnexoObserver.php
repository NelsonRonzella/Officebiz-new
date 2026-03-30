<?php

namespace App\Observers;

use App\Models\OrderAttachment;
use App\Notifications\PedidoAtualizadoNotification;
use Illuminate\Support\Facades\Notification;

class PedidoAnexoObserver
{

    public function created(OrderAttachment $anexo)
    {
        $pedido = $anexo->order;

        $emails = [
            config('mail.from.address'),
            $pedido->user->email
        ];

        Notification::route('mail', $emails)
            ->notify(new PedidoAtualizadoNotification($pedido, 'Novo anexo'));
    }
}