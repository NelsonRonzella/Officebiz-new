<x-app-layout>

    <div class="space-y-6">

        {{-- Card de título --}}
        <x-title-card 
            title="Pedidos" 
            breadcrumb="Home > Pedidos" 
        />

        {{-- Botão Criar Pedido --}}
        <x-primary-button>
            + Criar pedido
        </x-primary-button>

        {{-- Card com tabela --}}
        <x-card title="Pedidos pendentes">

            {{-- Tabela dinâmica usando componentes --}}
            <x-orders-table :orders="[
                [
                    'number' => '3066',
                    'licensed' => [
                        'name' => 'Olivia Rhye',
                        'email' => 'olivia@ui.com'
                    ],
                    'client' => [
                        'name' => 'Olivia Rhye',
                        'email' => 'olivia@ui.com'
                    ],
                    'product' => 'Registro de marca',
                    'status' => [
                        'type' => 'aguardando',
                        'label' => 'Aguard. pag.'
                    ],
                    'progress' => 60
                ],
                [
                    'number' => 3066,
                    'licensed' => [
                        'name' => 'Olivia Rhye',
                        'email' => 'olivia@ui.com'
                    ],
                    'client' => [
                        'name' => 'Olivia Rhye',
                        'email' => 'olivia@ui.com'
                    ],
                    'product' => 'Registro de marca',
                    'status' => [
                        'type' => 'andamento',
                        'label' => 'Em andamento'
                    ],
                    'progress' => 60
                ],
                [
                    'number' => 3066,
                    'licensed' => [
                        'name' => 'Olivia Rhye',
                        'email' => 'olivia@ui.com'
                    ],
                    'client' => [
                        'name' => 'Olivia Rhye',
                        'email' => 'olivia@ui.com'
                    ],
                    'product' => 'Logo',
                    'status' => [
                        'type' => 'cancelado',
                        'label' => 'Cancelado'
                    ],
                    'progress' => 60
                ],
                [
                    'number' => 3066,
                    'licensed' => [
                        'name' => 'Olivia Rhye',
                        'email' => 'olivia@ui.com'
                    ],
                    'client' => [
                        'name' => 'Olivia Rhye',
                        'email' => 'olivia@ui.com'
                    ],
                    'product' => 'Registro de marca',
                    'status' => [
                        'type' => 'retorno',
                        'label' => 'Retorno'
                    ],
                    'progress' => 60
                ]
            ]" />

        </x-card>

    </div>

</x-app-layout>