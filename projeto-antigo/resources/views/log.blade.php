<x-app-layout>

    <div class="space-y-6">

        <x-title-card
            title="Log"
            breadcrumb="Home > Log"
        />

        <x-card title="Logs">

            <form method="GET" class="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">

                <x-filter-input name="search" placeholder="Buscar ação ou model..." />
                <x-filter-input name="user" type="number" placeholder="ID do usuário" />
                <x-filter-input name="model" placeholder="Model (ex: User)" />
                <x-filter-input name="date" type="date" />

                <div class="flex gap-2">
                    <button data-cy="btn-filtrar" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">
                        Filtrar
                    </button>
                    <a href="{{ route('log') }}" data-cy="link-limpar" class="bg-gray-300 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded text-sm">
                        Limpar
                    </a>
                </div>

            </form>

            <x-logs-table :logs="$logs" />

            <div class="mt-6">
                {{ $logs->links() }}
            </div>

        </x-card>

    </div>

</x-app-layout>
