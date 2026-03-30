@props([
    'nome',
    'data',
    'texto',
    'arquivo'=>null,
    'url'=>null
])

<x-card>

    <div class="flex items-start gap-4">

        <x-heroicon-o-user-circle class="w-10 h-10 text-gray-500 dark:text-gray-400"/>

        <div class="flex-1">

            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                <span class="font-medium text-gray-800 dark:text-gray-100">{{ $nome }}</span>
                <span>•</span>
                <span>{{ $data }}</span>
            </div>

            @if($texto)
                <p data-cy="mensagem-texto" class="text-gray-700 dark:text-gray-200 mb-3">{{ $texto }}</p>
            @endif

            @if ($arquivo)

                <a href="{{ $url }}"
                    target="_blank"
                    class="flex items-center gap-2 text-blue-600 hover:underline">

                    <x-heroicon-o-document class="w-5 h-5 text-gray-500"/>

                    {{ $arquivo }}

                </a>

            @endif

        </div>

    </div>

</x-card>