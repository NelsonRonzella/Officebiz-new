<?php

namespace App\Services;

use App\Models\Order;

class OrderProgressService
{
    public function recalculate(Order $order): void
    {
        $order->load('steps');

        if (!$order->isEmAndamento()) {

            $order->update([
                'progresso' => 0
            ]);

            return;
        }

        $total = $order->steps->count();

        if ($total === 0) {
            return;
        }

        $completed = $order->steps
            ->whereNotNull('finished_at')
            ->count();

        $percent = intval(($completed / $total) * 100);

        $order->update([
            'progresso' => $percent
        ]);
    }
}