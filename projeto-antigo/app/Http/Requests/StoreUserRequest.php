<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'telefone' => 'required|string',
            'password' => 'required|min:6',
            'role'     => 'required|string',
            'cpf'      => 'nullable|string',
            'cnpj'     => 'nullable|string',
            'cep'      => 'nullable|string',
            'endereco' => 'nullable|string',
            'numero'   => 'nullable|string',
            'bairro'   => 'nullable|string',
            'cidade'   => 'nullable|string',
            'estado'   => 'nullable|string',
        ];
    }
}