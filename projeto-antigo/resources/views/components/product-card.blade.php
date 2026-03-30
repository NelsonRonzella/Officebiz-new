@props([
    'image' => null,
    'tempo' => 'Tempo médio 3 meses',
    'titulo' => 'Nome do produto',
    'descricao' => 'Descrição breve do produto.',
    'tutorial' => '#',
    'contratar' => '#'
])

<div class="bg-white dark:bg-gray-800 rounded-xl shadow p-0 overflow-hidden border dark:border-gray-700">
    
    {{-- Imagem --}}
    <img 
        src="{{ $image ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' }}" 
        alt="{{ $titulo }}" 
        class="w-full h-48 object-cover"
    >

    {{-- Conteúdo --}}
    <div class="p-4 space-y-2">

        {{-- Tempo estimado --}}
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <x-heroicon-o-clock class="w-4 h-4" />
            {{ $tempo }}
        </div>

        {{-- Título --}}
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">
            {{ $titulo }}
        </h3>

        {{-- Descrição --}}
        <p class="text-gray-600 dark:text-gray-400 text-sm">
            {{ $descricao }}
        </p>

        {{-- Botões --}}
        <div class="flex justify-between items-center pt-2">

            <x-secondary-button-link href="{{ $tutorial }}">
                Ver tutorial
            </x-secondary-button-link>

            <x-primary-button-link href="{{ $contratar }}">
                Contratar
            </x-primary-button-link>

        </div>

    </div>

</div>
