<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\OrderStep;
use App\Notifications\PrazoVencendoNotification;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class CheckOrderDeadlines extends Command
{
    protected $signature   = 'orders:check-deadlines';
    protected $description = 'Envia notificações de prazo vencendo ou vencido nas etapas dos pedidos';

    public function handle(NotificationService $notificationService): void
    {
        // Etapas em andamento (started, not finished) com duration_days definido
        $steps = OrderStep::whereNotNull('started_at')
            ->whereNull('finished_at')
            ->whereNotNull('duration_days')
            ->where('duration_days', '>', 0)
            ->with('order')
            ->get();

        foreach ($steps as $step) {
            $order    = Order::find($step->order_id);
            $deadline = $step->started_at->addDays($step->duration_days);
            $now      = now();

            $vencido    = $now->isAfter($deadline);
            $vencendoEm2Dias = ! $vencido && $deadline->diffInDays($now) <= 2;

            if (! $vencido && ! $vencendoEm2Dias) {
                continue;
            }

            $recipients = $notificationService->recipientsPrazo($order);

            Notification::send($recipients, new PrazoVencendoNotification($order, $step, $vencido));
        }

        $this->info('Verificação de prazos concluída.');
    }
}
