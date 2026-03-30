<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Pedido criado → Admin (sempre) + Licenciado (criador) + Cliente
     */
    public function recipientsPedidoCriado(Order $order, int $actorId): Collection
    {
        return $this->resolveUsers(
            order: $order,
            includeAdmin: true,
            includeLicenciado: true,
            includePrestador: false,
            includeCliente: true,
            actorId: $actorId,
        );
    }

    /**
     * Etapa avançada → Admin (sempre) + Licenciado + Prestador + Cliente
     */
    public function recipientsEtapaAvancada(Order $order, int $actorId): Collection
    {
        return $this->resolveUsers(
            order: $order,
            includeAdmin: true,
            includeLicenciado: true,
            includePrestador: true,
            includeCliente: true,
            actorId: $actorId,
        );
    }

    /**
     * Mensagem adicionada → Admin (sempre) + Licenciado + Prestador (não Cliente)
     */
    public function recipientsMensagem(Order $order, int $actorId): Collection
    {
        return $this->resolveUsers(
            order: $order,
            includeAdmin: true,
            includeLicenciado: true,
            includePrestador: true,
            includeCliente: false,
            actorId: $actorId,
        );
    }

    /**
     * Pedido concluído → Admin + Licenciado + Prestador + Cliente
     */
    public function recipientsConclusao(Order $order, int $actorId): Collection
    {
        return $this->resolveUsers(
            order: $order,
            includeAdmin: true,
            includeLicenciado: true,
            includePrestador: true,
            includeCliente: true,
            actorId: $actorId,
        );
    }

    /**
     * Prestador trocado → Admin (sempre) + Licenciado + Novo prestador
     */
    public function recipientsPrestadorTrocado(Order $order, int $actorId): Collection
    {
        return $this->resolveUsers(
            order: $order,
            includeAdmin: true,
            includeLicenciado: true,
            includePrestador: true,
            includeCliente: false,
            actorId: $actorId,
        );
    }

    /**
     * Prazo vencendo/vencido → Admin + Licenciado + Prestador
     */
    public function recipientsPrazo(Order $order): Collection
    {
        return $this->resolveUsers(
            order: $order,
            includeAdmin: true,
            includeLicenciado: true,
            includePrestador: true,
            includeCliente: false,
        );
    }

    private function resolveUsers(
        Order $order,
        bool $includeAdmin,
        bool $includeLicenciado,
        bool $includePrestador,
        bool $includeCliente,
        ?int $actorId = null,
    ): Collection {
        $adminIds = $includeAdmin
            ? User::where('role', User::ADMIN)->pluck('id')
            : collect();

        $otherIds = collect();

        if ($includeLicenciado && $order->criado_por) {
            $otherIds->push($order->criado_por);
        }

        if ($includePrestador && $order->prestador) {
            $otherIds->push($order->prestador);
        }

        if ($includeCliente && $order->user_id) {
            $otherIds->push($order->user_id);
        }

        // Admins recebem tudo — nunca são excluídos por serem o ator.
        // Não-admins são excluídos se foram eles que dispararam a ação.
        $ids = $adminIds
            ->merge($otherIds->unique()->reject(fn ($id) => $id === $actorId))
            ->unique();

        return User::whereIn('id', $ids)->get();
    }
}
