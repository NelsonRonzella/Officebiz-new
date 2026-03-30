<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTutorialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'title' => 'required|string|max:255',

            'description' => 'required|string',

            'link' => 'required|url',

            'products' => 'nullable|array',

            'products.*' => 'exists:products,id',

        ];
    }
}