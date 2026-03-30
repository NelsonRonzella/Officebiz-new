<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderDocumentCategory extends Model
{
    protected $fillable = [
        'order_id',
        'product_document_category_id',
        'title',
        'description',
        'order',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function productDocumentCategory(): BelongsTo
    {
        return $this->belongsTo(ProductDocumentCategory::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(OrderAttachment::class);
    }
}
