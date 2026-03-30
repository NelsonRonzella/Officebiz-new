<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'message',
        'date',
        'photo',
        'video',
        'file'
    ];

    protected $casts = [
        'date' => 'date'
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFileUrlAttribute()
    {
        return $this->file ? route('order-message.download', $this->id) : null;
    }

    public function getFileNameAttribute()
    {
        return $this->file ? basename($this->file) : null;
    }
}