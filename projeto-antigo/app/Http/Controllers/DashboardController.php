<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{

    public function index()
    {
        $role = Auth::user()->role ?? null;

        if ($role === 'cliente') {
            return redirect()->route('dashboard-cliente');
        }

        if ($role === 'prestador') {
            return redirect()->route('dashboard-prestador');
        }

        $statusCount = Order::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total','status');

        $pedidosPendentes = Order::with(['user','product', 'criador'])
            ->where('status', OrderStatusEnum::AGUARDANDO_PAGAMENTO)
            ->latest()
            ->limit(10)
            ->get();

        return view('dashboard', [
            'statusCount' => $statusCount,
            'pedidosPendentes' => $pedidosPendentes
        ]);

    }


    public function faturamentoMensal()
    {

        $data = Order::selectRaw('MONTH(created_at) mes, COUNT(*) total')
            ->where('status', OrderStatusEnum::EM_ANDAMENTO)
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        return response()->json($data);

    }


    public function pedidosPorDia()
    {

        $data = Order::selectRaw('DAY(created_at) dia, COUNT(*) total')
            ->whereMonth('created_at', now()->month)
            ->groupBy('dia')
            ->orderBy('dia')
            ->get();

        return response()->json($data);

    }

}