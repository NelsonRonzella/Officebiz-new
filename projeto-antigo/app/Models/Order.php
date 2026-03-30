<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\OrderStatusEnum;

class Order extends Model
{
    use HasFactory;

    protected $casts = [
        'status' => OrderStatusEnum::class,
    ];

    protected $fillable = [
        'user_id',
        'product_id',
        'status',
        'criado_por',
        'prestador',
        'progresso',
        'current_step_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Usuário que criou o pedido
     */
    public function criador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por');
    }

    /**
     * Prestador do pedido
     */
    public function prestador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prestador');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(OrderAttachment::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(OrderMessage::class)->latest();
    }

    public function getStatusLabelAttribute()
    {
        return $this->status->label();
    }

    /**
     * Scope para filtrar pedidos conforme o tipo do usuário
     */
    public function scopeForUser($query, $user)
    {
        return $query->when($user->role === 'licenciado', function($q) use ($user) {
            $q->where('criado_por', $user->id);
        })
        ->when($user->role === 'prestador', function($q) use ($user) {
            $q->where(function($q2) use ($user) {
                $q2->where('prestador', $user->id)
                   ->orWhere(function($q3) {
                       $q3->whereNull('prestador')
                          ->where('status', OrderStatusEnum::PAGO);
                   });
            });
        })
        ->when($user->role === 'cliente', function($q) use ($user) {
            $q->where('user_id', $user->id);
        });
        // admin não precisa de filtro
    }

    /**
     * Verifica se o usuário tem permissão para visualizar este pedido.
     * Mesma lógica do scopeForUser, aplicada a uma instância.
     */
    public function canBeViewedBy(User $user): bool
    {
        return match ($user->role) {
            'admin'      => true,
            'licenciado' => $this->criado_por === $user->id,
            'cliente'    => $this->user_id    === $user->id,
            'prestador'  => $this->prestador === $user->id ||
                            (is_null($this->prestador) && $this->isPago()),
            default      => false,
        };
    }

    /**
     * Helpers de status
     */
    public function isAguardandoPagamento(): bool
    {
        return $this->status === OrderStatusEnum::AGUARDANDO_PAGAMENTO;
    }

    public function isEmAndamento(): bool
    {
        return $this->status === OrderStatusEnum::EM_ANDAMENTO;
    }

    public function isCancelado(): bool
    {
        return $this->status === OrderStatusEnum::CANCELADO;
    }

    public function isRetorno(): bool
    {
        return $this->status === OrderStatusEnum::RETORNO;
    }

    public function isPago(): bool
    {
        return $this->status === OrderStatusEnum::PAGO;
    }

    public function isConcluido(): bool
    {
        return $this->status === OrderStatusEnum::CONCLUIDO;
    }

    public function hasPrestador(): bool
    {
        return !is_null($this->prestador);
    }

    public function isPrestador($user): bool
    {
        return $this->prestador === $user->id;
    }

    public function steps(): HasMany
    {
        return $this->hasMany(OrderStep::class)->orderBy('order');
    }

    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(OrderStep::class, 'current_step_id');
    }

    public function documentCategories(): HasMany
    {
        return $this->hasMany(OrderDocumentCategory::class)->orderBy('order');
    }

    public function prestadorLogs(): HasMany
    {
        return $this->hasMany(OrderPrestadorLog::class)->latest();
    }

}