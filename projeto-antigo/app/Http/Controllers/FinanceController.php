<?php

namespace App\Http\Controllers;

use App\Models\Order;

class FinanceController extends Controller
{

    public function index()
    {

        $orders = Order::with([
            'user',
            'product'
        ])
        ->latest()
        ->paginate(10);

        return view('financeiro', compact('orders'));
    }
}