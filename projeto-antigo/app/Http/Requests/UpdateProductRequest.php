<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('price')) {
            $this->merge([
                'price' => str_replace(',', '.', $this->price),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name'        => 'required|string',
            'description' => 'required|string',
            'price'       => 'required|numeric',
            'type'        => 'required|in:pontual,recorrente',
            'etapas'      => 'nullable|string',
            'abas'        => 'nullable|string',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->input('type') === 'pontual') {
                $etapas = json_decode($this->input('etapas', '[]'), true);
                if (empty($etapas)) {
                    $validator->errors()->add('etapas', 'Produtos do tipo pontual devem ter ao menos 1 etapa cadastrada.');
                    return;
                }
                foreach ($etapas as $i => $etapa) {
                    $n = $i + 1;
                    if (empty($etapa['titulo']))   $validator->errors()->add('etapas', "O título da etapa {$n} é obrigatório.");
                    if (empty($etapa['descricao'])) $validator->errors()->add('etapas', "A descrição da etapa {$n} é obrigatória.");
                    if ($etapa['tempo'] === '' || $etapa['tempo'] === null) $validator->errors()->add('etapas', "O tempo da etapa {$n} é obrigatório.");
                    if ($etapa['ordem'] === '' || $etapa['ordem'] === null) $validator->errors()->add('etapas', "A ordenação da etapa {$n} é obrigatória.");
                }
            } elseif ($this->input('type') === 'recorrente') {
                $abas = json_decode($this->input('abas', '[]'), true);
                if (empty($abas)) {
                    $validator->errors()->add('abas', 'Produtos do tipo recorrente devem ter ao menos 1 aba cadastrada.');
                    return;
                }
                foreach ($abas as $i => $aba) {
                    $n = $i + 1;
                    if (empty($aba['titulo']))   $validator->errors()->add('abas', "O título da aba {$n} é obrigatório.");
                    if (empty($aba['descricao'])) $validator->errors()->add('abas', "A descrição da aba {$n} é obrigatória.");
                    if ($aba['ordem'] === '' || $aba['ordem'] === null) $validator->errors()->add('abas', "A ordenação da aba {$n} é obrigatória.");
                }
            }
        });
    }
}
