<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContratoController extends Controller
{
    public function index()
    {
        $arquivos = Storage::files('contratos');

        $arquivos = collect($arquivos)->map(function ($arquivo) {
            return [
                'nome' => basename($arquivo),
                'path' => $arquivo
            ];
        });

        return view('contratos', compact('arquivos'));
    }

    public function upload(Request $request)
    {
        $request->validate([
            'contrato' => 'required|file|max:10240'
        ]);

        $arquivo = $request->file('contrato');

        $nome = time() . '_' . $arquivo->getClientOriginalName();

        $arquivo->storeAs('contratos', $nome);

        if ($request->ajax()) {
            return response()->json(['message' => 'Contrato enviado com sucesso!', 'redirect' => route('contratos')]);
        }

        return redirect()->route('contratos')->with('success', 'Contrato enviado!');
    }

    public function download($arquivo)
    {
        $path = 'contratos/' . $arquivo;

        if (!Storage::exists($path)) {
            abort(404);
        }

        return Storage::download($path);
    }
}