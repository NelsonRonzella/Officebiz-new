<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{

    public function index(Request $request)
    {
        $role = $request->get('role');

        $users = User::when($role, function ($query) use ($role) {
            $query->where('role', $role);
        })
        ->latest()
        ->paginate(10);

        return view('clientes', compact('users', 'role'));
    }


    public function show($id)
    {
        $user = User::findOrFail($id);

        return view('cadastrar-cliente', compact('user'));
    }


    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        $data['password'] = bcrypt($data['password']);

        $data['role'] = $request->role ?? User::CLIENTE;

        User::create($data);

        if ($request->ajax()) {
            return response()->json(['message' => 'Usuário criado com sucesso!', 'redirect' => route('clientes')]);
        }

        return redirect()
            ->route('clientes')
            ->with('success','Usuário criado');
    }


    public function edit($id)
    {
        $user = User::findOrFail($id);

        return view('cadastrar-cliente', compact('user'));
    }

    public function update(UpdateUserRequest $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validated();

        if(!empty($data['password'])){
            $data['password'] = bcrypt($data['password']);
        }else{
            unset($data['password']);
        }

        $user->update($data);

        if ($request->ajax()) {
            return response()->json(['message' => 'Usuário atualizado com sucesso!']);
        }

        return back()->with('success','Usuário atualizado com sucesso');
    }

    public function toggle(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $user->active = !$user->active;

        $user->save();

        if ($request->ajax()) {
            $status = $user->active ? 'ativado' : 'desativado';
            return response()->json(['message' => "Usuário {$status} com sucesso!"]);
        }

        return back();
    }

    public function clientes()
    {
        $users = User::where('role', User::CLIENTE)
            ->latest()
            ->paginate(10);

        return view('clientes', compact('users'));
    }

    public function administradores()
    {
        $users = User::where('role', User::ADMIN)
            ->latest()
            ->paginate(10);

        return view('administradores', compact('users'));
    }

    public function licenciados()
    {
        $users = User::where('role', User::LICENCIADO)
            ->latest()
            ->paginate(10);

        return view('licenciados', compact('users'));
    }

    public function prestadores()
    {
        $users = User::where('role', User::PRESTADOR)
            ->latest()
            ->paginate(10);

        return view('prestadores', compact('users'));
    }
}