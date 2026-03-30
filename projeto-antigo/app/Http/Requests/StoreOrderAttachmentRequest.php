<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id'                   => 'required|exists:orders,id',
            'order_document_category_id' => 'nullable|exists:order_document_categories,id',
            'files'                      => 'required|array|min:1',
            'files.*'                    => 'file|max:20480',
        ];
    }
}