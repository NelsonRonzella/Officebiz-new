<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductDocumentCategory extends Model
{
    protected $fillable = [
        'product_id',
        'title',
        'description',
        'order',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function orderDocumentCategories(): HasMany
    {
        return $this->hasMany(OrderDocumentCategory::class);
    }
}
