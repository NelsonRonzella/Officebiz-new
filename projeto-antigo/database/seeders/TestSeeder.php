<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Product;
use App\Models\ProductStep;
use App\Models\ProductDocumentCategory;
use App\Models\Order;
use App\Models\Tutorial;
use App\Enums\OrderStatusEnum;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        // -------------------------------------------------------
        // 1. Usuários dos 4 papéis (reutiliza o UserSeeder)
        // -------------------------------------------------------
        $this->call(UserSeeder::class);

        // Usuário inativo para testes de bloqueio de login
        User::updateOrCreate(
            ['email' => 'inativo@exemplo.com'],
            [
                'name'     => 'Usuário Inativo',
                'password' => Hash::make('testeteste'),
                'role'     => User::CLIENTE,
                'telefone' => '11999990099',
                'active'   => false,
            ]
        );

        // -------------------------------------------------------
        // 2. Produtos de teste
        // -------------------------------------------------------

        // Produto pontual ativo (com etapas)
        $pontual = Product::updateOrCreate(
            ['name' => 'Produto Pontual Teste'],
            [
                'description' => 'Produto para testes E2E',
                'price'       => 150.00,
                'type'        => 'pontual',
                'active'      => true,
            ]
        );

        if ($pontual->steps()->count() === 0) {
            ProductStep::create([
                'product_id'    => $pontual->id,
                'title'         => 'Etapa Inicial',
                'description'   => 'Primeira etapa do produto pontual de teste',
                'order'         => 1,
                'duration_days' => 5,
            ]);

            ProductStep::create([
                'product_id'    => $pontual->id,
                'title'         => 'Etapa Final',
                'description'   => 'Última etapa do produto pontual de teste',
                'order'         => 2,
                'duration_days' => 3,
            ]);
        }

        // Produto recorrente ativo (com abas de documentos)
        $recorrente = Product::updateOrCreate(
            ['name' => 'Produto Recorrente Teste'],
            [
                'description' => 'Produto recorrente para testes E2E',
                'price'       => 299.00,
                'type'        => 'recorrente',
                'active'      => true,
            ]
        );

        if ($recorrente->documentCategories()->count() === 0) {
            ProductDocumentCategory::create([
                'product_id'  => $recorrente->id,
                'title'       => 'Aba de Documentos Teste',
                'description' => 'Aba para testes E2E',
                'order'       => 1,
            ]);
        }

        // Produto inativo (não deve aparecer na criação de pedidos)
        Product::updateOrCreate(
            ['name' => 'Produto Inativo Teste'],
            [
                'description' => 'Este produto não deve aparecer na criação de pedidos',
                'price'       => 50.00,
                'type'        => 'pontual',
                'active'      => false,
            ]
        );

        // -------------------------------------------------------
        // 3. Pedidos de teste (um de cada status relevante)
        // -------------------------------------------------------
        $admin      = User::where('email', 'admin@exemplo.com')->first();
        $cliente    = User::where('email', 'cliente@exemplo.com')->first();
        $prestador  = User::where('email', 'prestador@exemplo.com')->first();
        $licenciado = User::where('email', 'licenciado@exemplo.com')->first();

        if ($admin && $cliente) {

            // Apaga todos os pedidos dos usuários de teste para garantir estado limpo
            Order::whereIn('user_id', array_filter([
                $cliente->id,
                $prestador?->id,
            ]))->delete();

            // Pedido aguardando pagamento (status padrão ao criar)
            Order::create([
                'user_id'    => $cliente->id,
                'product_id' => $pontual->id,
                'status'     => OrderStatusEnum::AGUARDANDO_PAGAMENTO,
                'criado_por' => $admin->id,
                'progresso'  => 0,
            ]);

            // Pedido pago e sem prestador (para prestador poder aceitar)
            Order::create([
                'user_id'    => $cliente->id,
                'product_id' => $pontual->id,
                'status'     => OrderStatusEnum::PAGO,
                'criado_por' => $admin->id,
                'prestador'  => null,
                'progresso'  => 0,
            ]);

            // Pedido em andamento com prestador atribuído (criado pelo admin)
            if ($prestador) {
                Order::create([
                    'user_id'    => $cliente->id,
                    'product_id' => $pontual->id,
                    'status'     => OrderStatusEnum::EM_ANDAMENTO,
                    'criado_por' => $admin->id,
                    'prestador'  => $prestador->id,
                    'progresso'  => 25,
                ]);
            }

            // Pedido em andamento criado pelo licenciado (para o licenciado poder ver seus pedidos)
            if ($licenciado && $prestador) {
                Order::create([
                    'user_id'    => $cliente->id,
                    'product_id' => $pontual->id,
                    'status'     => OrderStatusEnum::EM_ANDAMENTO,
                    'criado_por' => $licenciado->id,
                    'prestador'  => $prestador->id,
                    'progresso'  => 0,
                ]);
            }

            // Pedido cancelado
            Order::create([
                'user_id'    => $cliente->id,
                'product_id' => $pontual->id,
                'status'     => OrderStatusEnum::CANCELADO,
                'criado_por' => $admin->id,
                'progresso'  => 0,
            ]);

            // Pedido recorrente em andamento
            if ($prestador) {
                Order::create([
                    'user_id'    => $cliente->id,
                    'product_id' => $recorrente->id,
                    'status'     => OrderStatusEnum::EM_ANDAMENTO,
                    'criado_por' => $admin->id,
                    'prestador'  => $prestador->id,
                    'progresso'  => 0,
                ]);
            }

        }

        // -------------------------------------------------------
        // 4. Tutorial de teste
        // -------------------------------------------------------
        Tutorial::updateOrCreate(
            ['title' => 'Tutorial E2E Teste Fixo'],
            [
                'description' => 'Tutorial criado pelo seeder para testes E2E',
                'link'        => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ]
        );
    }
}
