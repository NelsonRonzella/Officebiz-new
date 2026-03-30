<?php

namespace App\Observers;

use App\Models\Order;
use App\Notifications\PedidoCriadoNotification;
use App\Notifications\PedidoAtualizadoNotification;
use Illuminate\Support\Facades\Notification;

class PedidoObserver
{

    public function created(Order $pedido)
    {
        $emails = [
            config('mail.from.address'),
            $pedido->user->email
        ];

        Notification::route('mail', $emails)
            ->notify(new PedidoCriadoNotification($pedido));
    }

    public function updated(Order $pedido)
    {
        if ($pedido->wasChanged('status')) {

            $emails = [
                config('mail.from.address'),
                $pedido->user->email
            ];

            Notification::route('mail', $emails)
                ->notify(new PedidoAtualizadoNotification($pedido, 'Status alterado'));
        }
    }
}