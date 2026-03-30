<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'order_document_category_id',
        'file',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function documentCategory(): BelongsTo
    {
        return $this->belongsTo(OrderDocumentCategory::class, 'order_document_category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getUrlAttribute()
    {
        return route('order-attachment.download', $this->id);
    }

    public function getNomeAttribute()
    {
        return basename($this->file);
    }
}