<?php

namespace App\Observers;

use App\Models\OrderMessage;
use Illuminate\Support\Facades\Auth;

class OrderMessageObserver
{

    public function created(OrderMessage $message)
    {
        activity()
            ->causedBy(Auth::id())
            ->performedOn($message)
            ->log('Mensagem enviada no pedido');
    }
}