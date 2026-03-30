<?php

namespace App\Enums;

enum ProductTypeEnum:string
{
    case PONTUAL = 'pontual';
    case RECORRENTE = 'recorrente';

    public function label(): string
    {
        return match($this) {
            self::PONTUAL => 'Pontual',
            self::RECORRENTE => 'Recorrente'
        };
    }
}