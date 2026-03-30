<?php

namespace App\Enums;

enum OrderStatusEnum:int
{
    case AGUARDANDO_PAGAMENTO = 0;
    case EM_ANDAMENTO = 1;
    case CANCELADO = 2;
    case RETORNO = 3;
    case PAGO = 4;
    case CONCLUIDO = 5;

    public function label(): string
    {
        return match($this) {
            self::AGUARDANDO_PAGAMENTO => 'Aguardando pagamento',
            self::EM_ANDAMENTO => 'Em andamento',
            self::CANCELADO => 'Cancelado',
            self::RETORNO => 'Retorno',
            self::PAGO => 'Pago',
            self::CONCLUIDO => 'Concluído',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::AGUARDANDO_PAGAMENTO => 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
            self::EM_ANDAMENTO         => 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            self::CANCELADO            => 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
            self::RETORNO              => 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
            self::PAGO                 => 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
            self::CONCLUIDO            => 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::AGUARDANDO_PAGAMENTO => 'clock',
            self::EM_ANDAMENTO => 'arrow-path',
            self::CANCELADO => 'x-circle',
            self::RETORNO => 'arrow-path',
            self::PAGO => 'banknotes',
            self::CONCLUIDO => 'check-circle',
        };
    }
}