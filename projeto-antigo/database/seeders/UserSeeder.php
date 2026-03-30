<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@exemplo.com'],
            [
                'name'     => 'Admin Exemplo',
                'password' => Hash::make('testeteste'),
                'role'     => User::ADMIN,
                'telefone' => '11999990001',
                'active'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'licenciado@exemplo.com'],
            [
                'name'     => 'Licenciado Exemplo',
                'password' => Hash::make('testeteste'),
                'role'     => User::LICENCIADO,
                'telefone' => '11999990002',
                'active'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'cliente@exemplo.com'],
            [
                'name'     => 'Cliente Exemplo',
                'password' => Hash::make('testeteste'),
                'role'     => User::CLIENTE,
                'telefone' => '11999990003',
                'active'   => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'prestador@exemplo.com'],
            [
                'name'     => 'Prestador Exemplo',
                'password' => Hash::make('testeteste'),
                'role'     => User::PRESTADOR,
                'telefone' => '11999990004',
                'active'   => true,
            ]
        );
    }
}
