<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasPushSubscriptions;

    public const ADMIN = 'admin';
    public const LICENCIADO = 'licenciado';
    public const CLIENTE = 'cliente';
    public const PRESTADOR = 'prestador';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'active',
        'cpf',
        'cnpj',
        'telefone',
        'cep',
        'endereco',
        'numero',
        'bairro',
        'cidade',
        'estado'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function orderMessages(): HasMany
    {
        return $this->hasMany(OrderMessage::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public function isAdmin(): bool
    {
        return $this->role === self::ADMIN;
    }

    public function isCliente(): bool
    {
        return $this->role === self::CLIENTE;
    }

    public function isPrestador(): bool
    {
        return $this->role === self::PRESTADOR;
    }

    public function isLicenciado(): bool
    {
        return $this->role === self::LICENCIADO;
    }
}