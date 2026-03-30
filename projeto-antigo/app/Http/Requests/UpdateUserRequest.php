<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => 'required|string',
            'email'    => 'required|email',
            'telefone' => 'required|string',
            'role'     => 'nullable|string',
            'cpf'      => 'nullable|string',
            'cnpj'     => 'nullable|string',
            'cep'      => 'nullable|string',
            'endereco' => 'nullable|string',
            'numero'   => 'nullable|string',
            'bairro'   => 'nullable|string',
            'cidade'   => 'nullable|string',
            'estado'   => 'nullable|string',
            'password' => 'nullable|min:6|confirmed',
        ];
    }
}