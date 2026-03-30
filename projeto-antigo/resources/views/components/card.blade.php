<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">

    {{-- Título opcional --}}
    @isset($title)
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {{ $title }}
            </h3>
        </div>
    @endisset

    {{-- Conteúdo --}}
    <div class="px-6 py-4">
        {{ $slot }}
    </div>

</div>
