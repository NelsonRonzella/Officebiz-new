<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'required|exists:orders,id',
            'message' => 'required|string',
            'photo' => 'nullable|image',
            'video' => 'nullable|file',
            'file' => 'nullable|file'
        ];
    }
}