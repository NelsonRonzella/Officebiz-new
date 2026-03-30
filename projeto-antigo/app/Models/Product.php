<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory;

    public const TYPE_PONTUAL = 'pontual';
    public const TYPE_RECORRENTE = 'recorrente';

    protected $fillable = [
        'name',
        'description',
        'price',
        'type',
        'active'
    ];

    protected $casts = [
        'active' => 'boolean'
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(ProductStep::class);
    }

    public function documentCategories(): HasMany
    {
        return $this->hasMany(ProductDocumentCategory::class)->orderBy('order');
    }

    public function isRecorrente(): bool
    {
        return $this->type === self::TYPE_RECORRENTE;
    }

    public function tutorials(): BelongsToMany
    {
        return $this->belongsToMany(Tutorial::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

}