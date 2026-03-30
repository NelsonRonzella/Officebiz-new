<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('causer');

        // Busca geral
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('subject_type', 'like', "%{$search}%")
                    ->orWhere('subject_id', 'like', "%{$search}%");
            });
        }

        // Filtro por usuário
        if ($request->filled('user')) {
            $query->where('causer_id', $request->user);
        }

        // Filtro por model
        if ($request->filled('model')) {
            $query->where('subject_type', 'like', "%{$request->model}%");
        }

        // Filtro por data
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $logs = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return view('log', compact('logs'));
    }
}