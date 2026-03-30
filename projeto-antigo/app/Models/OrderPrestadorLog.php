<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPrestadorLog extends Model
{
    protected $fillable = [
        'order_id',
        'changed_by',
        'old_prestador_id',
        'new_prestador_id',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function oldPrestador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'old_prestador_id');
    }

    public function newPrestador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'new_prestador_id');
    }
}
