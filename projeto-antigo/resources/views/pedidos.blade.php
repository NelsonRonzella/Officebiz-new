<x-app-layout>

    <div class="space-y-6">

        <x-title-card
            title="Pedidos"
            breadcrumb="Home > Pedidos"
        />

        @php $role = Auth::user()->role ?? null; @endphp

        @if(in_array($role, ['admin', 'licenciado']))
            <x-primary-button-link href="{{ route('cadastrar-pedido') }}" data-cy="link-criar-pedido">
                + Criar pedido
            </x-primary-button-link>
        @endif

        <x-card title="Pedidos">

            <form method="GET" class="mb-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">

                <x-filter-input name="numero" type="number" placeholder="Nº do pedido" />
                <x-filter-input name="cliente_nome" placeholder="Nome do cliente" />

                @if($role === 'admin')
                    <x-filter-input name="licenciado_nome" placeholder="Nome do licenciado" />
                    <x-filter-input name="prestador_nome" placeholder="Nome do prestador" />
                @endif

                <x-filter-input name="cliente_email" placeholder="E-mail do cliente" />

                <select name="tipo_produto" class="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                    <option value="">Tipo de produto</option>
                    <option value="pontual" @selected(request('tipo_produto') === 'pontual')>Pontual</option>
                    <option value="recorrente" @selected(request('tipo_produto') === 'recorrente')>Recorrente</option>
                </select>

                <select name="status" class="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                    <option value="">Status</option>
                    @foreach(\App\Enums\OrderStatusEnum::cases() as $s)
                        <option value="{{ $s->value }}" @selected(request('status') == $s->value)>{{ $s->label() }}</option>
                    @endforeach
                </select>

                <x-filter-input name="data_inicio" type="date" title="Data inicial" />
                <x-filter-input name="data_fim" type="date" title="Data final" />

                <div class="flex gap-2">
                    <button type="submit" data-cy="btn-filtrar" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                        Filtrar
                    </button>
                    @if(request()->hasAny(['numero','cliente_nome','cliente_email','licenciado_nome','prestador_nome','tipo_produto','status','data_inicio','data_fim']))
                        <a href="{{ route('pedidos') }}" class="px-3 py-2 rounded border text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            ✕
                        </a>
                    @endif
                </div>

            </form>

            <x-orders-table :orders="$orders" />

            <div class="mt-6">
                {{ $orders->links() }}
            </div>

        </x-card>

    </div>

</x-app-layout>
