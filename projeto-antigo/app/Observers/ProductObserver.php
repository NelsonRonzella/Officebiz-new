<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class ProductObserver
{

    public function created(Product $product)
    {
        activity()
            ->causedBy(Auth::id())
            ->performedOn($product)
            ->log('Produto criado');
    }

    public function updated(Product $product)
    {
        activity()
            ->causedBy(Auth::id())
            ->performedOn($product)
            ->log('Produto atualizado');
    }
}