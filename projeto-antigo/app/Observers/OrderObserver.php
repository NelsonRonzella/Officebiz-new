<?php

namespace App\Observers;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class OrderObserver
{

    public function created(Order $order)
    {
        activity()
            ->causedBy(Auth::id())
            ->performedOn($order)
            ->log('Pedido criado');
    }

    public function updated(Order $order)
    {
        activity()
            ->causedBy(Auth::id())
            ->performedOn($order)
            ->log('Pedido atualizado');
    }
}