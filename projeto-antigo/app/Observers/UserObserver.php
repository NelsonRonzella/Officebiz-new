<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserObserver
{
    /**
     * Usuário criado
     */
    public function created(User $user): void
    {
        activity()
            ->performedOn($user)
            ->causedBy(Auth::id())
            ->log('Usuário criado');
    }

    /**
     * Usuário atualizado
     */
    public function updated(User $user): void
    {
        activity()
            ->performedOn($user)
            ->causedBy(Auth::id())
            ->log('Usuário atualizado');
    }

    /**
     * Usuário deletado
     */
    public function deleted(User $user): void
    {
        activity()
            ->performedOn($user)
            ->causedBy(Auth::id())
            ->log('Usuário deletado');
    }

    /**
     * Usuário restaurado
     */
    public function restored(User $user): void
    {
        activity()
            ->performedOn($user)
            ->causedBy(Auth::id())
            ->log('Usuário restaurado');
    }

    /**
     * Usuário removido permanentemente
     */
    public function forceDeleted(User $user): void
    {
        activity()
            ->performedOn($user)
            ->causedBy(Auth::id())
            ->log('Usuário removido permanentemente');
    }
}