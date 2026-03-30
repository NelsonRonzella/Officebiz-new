<x-app-layout>

    <div class="space-y-6">

        <x-title-card
            title="Produtos"
            breadcrumb="Home > Produtos"
        />

        @php $role = Auth::user()->role ?? null; @endphp

        @if(in_array($role, ['admin']))
            <x-primary-button-link :href="route('cadastrar-produto-pontual')">
                + Cadastrar produto pontual
            </x-primary-button-link>

            <x-primary-button-link :href="route('cadastrar-produto-recorrente')">
                + Cadastrar produto recorrente
            </x-primary-button-link>
        @endif

        <x-card title="Produtos">
            <form method="GET" class="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                <x-filter-input name="search" placeholder="Buscar produto..." />

                <select name="type" data-cy="select-tipo" class="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                    <option value="">Tipo</option>
                    <option value="pontual" @selected(request('type') == 'pontual')>Pontual</option>
                    <option value="recorrente" @selected(request('type') == 'recorrente')>Recorrente</option>
                </select>

                <select name="status" data-cy="select-status" class="border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                    <option value="">Status</option>
                    <option value="1" @selected(request('status') === '1')>Ativo</option>
                    <option value="0" @selected(request('status') === '0')>Inativo</option>
                </select>

                <button data-cy="btn-filtrar" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">
                    Filtrar
                </button>

            </form>

            <x-products-table :products="$products" />

            <div class="mt-6">
                {{ $products->links() }}
            </div>

        </x-card>

    </div>

</x-app-layout>
