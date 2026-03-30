<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\OrderAttachment;
use App\Models\OrderMessage;
use App\Models\Product;
use App\Models\User;
use App\Observers\OrderMessageObserver;
use App\Observers\OrderObserver;
use App\Observers\PedidoAnexoObserver;
use App\Observers\PedidoMensagemObserver;
use App\Observers\PedidoObserver;
use App\Observers\ProductObserver;
use App\Observers\UserObserver;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Logout;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Order::observe(OrderObserver::class);
        Product::observe(ProductObserver::class);
        OrderMessage::observe(OrderMessageObserver::class);
        Order::observe(PedidoObserver::class);
        OrderMessage::observe(PedidoMensagemObserver::class);
        OrderAttachment::observe(PedidoAnexoObserver::class);
        User::observe(UserObserver::class);

        Event::listen(Login::class, function ($event) {

            activity()
                ->causedBy($event->user)
                ->performedOn($event->user)
                ->log('Usuário fez login');

        });

        Event::listen(Logout::class, function ($event) {

            if ($event->user) {

                activity()
                    ->causedBy($event->user)
                    ->performedOn($event->user)
                    ->log('Usuário fez logout');
            }

        });
    }
}
