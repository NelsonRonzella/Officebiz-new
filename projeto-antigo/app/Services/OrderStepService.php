<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStep;
use Carbon\Carbon;

class OrderStepService
{
    public function createStepsFromProduct(Order $order): void
    {
        $steps = $order->product
            ->steps()
            ->orderBy('order')
            ->get();

        foreach ($steps as $step) {

            OrderStep::create([
                'order_id'      => $order->id,
                'title'         => $step->title,
                'description'   => $step->description,
                'order'         => $step->order,
                'duration_days' => $step->duration_days,
            ]);
        }
    }

    public function startFirstStep(Order $order): void
    {
        $first = $order->steps()
            ->orderBy('order')
            ->first();

        if (!$first) {
            return;
        }

        $first->update([
            'started_at' => Carbon::now()
        ]);

        $order->update([
            'current_step_id' => $first->id
        ]);
    }

    public function advance(Order $order): void
    {
        $current = $order->currentStep;

        if (!$current) {
            return;
        }

        $current->update([
            'finished_at' => Carbon::now()
        ]);

        $next = $order->steps()
            ->where('order', '>', $current->order)
            ->orderBy('order')
            ->first();

        if ($next) {

            $next->update([
                'started_at' => Carbon::now()
            ]);

            $order->update([
                'current_step_id' => $next->id
            ]);

        } else {

            $order->update([
                'current_step_id' => null
            ]);
        }

        app(OrderProgressService::class)
            ->recalculate($order);
    }
}