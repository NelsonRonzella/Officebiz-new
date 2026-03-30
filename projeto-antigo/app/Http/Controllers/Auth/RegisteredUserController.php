<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('cadastrar-cliente');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','string','email','max:255','unique:users'],
            'password' => ['required','confirmed','min:6'],

            'cpf' => ['nullable','string','max:20','unique:users'],
            'cnpj' => ['nullable','string','max:20','unique:users'],

            'telefone' => ['required','string','max:20'],

            'endereco' => ['nullable','string','max:255'],
            'numero' => ['nullable','string','max:50'],
            'bairro' => ['nullable','string','max:255'],
            'cidade' => ['nullable','string','max:255'],
            'estado' => ['nullable','string','max:255'],
        ]);

        if (auth()->user()->role !== 'admin' && $request->role !== 'cliente') {
            abort(403, 'Você não tem permissão para criar este tipo de usuário.');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,

            'cpf' => $request->cpf,
            'cnpj' => $request->cnpj,

            'telefone' => $request->telefone,

            'endereco' => $request->endereco,
            'numero' => $request->numero,
            'bairro' => $request->bairro,
            'cidade' => $request->cidade,
            'estado' => $request->estado,
            'role' => $request->role,

            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        return redirect()->back()->with('success','Usuário criado com sucesso');
    }
}
