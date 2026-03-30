<form method="GET" class="grid grid-cols-1 md:grid-cols-4 gap-3">

    <input
        type="date"
        name="data_inicio"
        value="{{ request('data_inicio') }}"
        class="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg w-full"
    />

    <input
        type="date"
        name="data_fim"
        value="{{ request('data_fim') }}"
        class="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg w-full"
    />

    <input
        type="text"
        name="search"
        value="{{ request('search') }}"
        placeholder="Buscar mensagem..."
        class="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg w-full"
    />

    <button data-cy="btn-filtrar" class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-lg px-4 py-2">
        Filtrar
    </button>

</form>