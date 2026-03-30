@props(['categories', 'orderId', 'readonly' => false])

@php
    $mesAtual = request('mes_aba');
@endphp

<x-card>

    <h2 class="text-lg font-semibold mb-4 dark:text-gray-100">Documentos</h2>

    <div
        x-data="{ activeTab: {{ $categories->first()?->id ?? 'null' }} }"
        class="space-y-4"
    >

        {{-- ABAS --}}
        <div class="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            @foreach($categories as $category)
                <button
                    type="button"
                    @click="activeTab = {{ $category->id }}"
                    :class="activeTab === {{ $category->id }}
                        ? 'bg-yellow-400 text-black font-semibold'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                    class="px-4 py-1.5 rounded-full text-sm transition"
                >
                    {{ $category->title }}
                </button>
            @endforeach
        </div>

        {{-- CONTEÚDO DE CADA ABA --}}
        @foreach($categories as $category)
            <div x-show="activeTab === {{ $category->id }}" x-cloak>

                @if($category->description)
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ $category->description }}</p>
                @endif

                {{-- Filtro por mês --}}
                <form method="GET" class="flex items-center gap-2 mb-4">
                    @foreach(request()->except('mes_aba') as $key => $val)
                        <input type="hidden" name="{{ $key }}" value="{{ $val }}">
                    @endforeach
                    <input
                        type="month"
                        name="mes_aba"
                        value="{{ $mesAtual }}"
                        class="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-400 focus:ring-blue-400"
                    >
                    <button type="submit" class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200 transition">
                        Filtrar
                    </button>
                    @if($mesAtual)
                        <a href="{{ request()->fullUrlWithoutQuery(['mes_aba']) }}" class="text-sm text-gray-500 dark:text-gray-400 hover:underline">Limpar</a>
                    @endif
                </form>

                {{-- Lista de arquivos --}}
                @php
                    $arquivos = $mesAtual
                        ? $category->attachments->filter(fn($a) => $a->created_at->format('Y-m') === $mesAtual)
                        : $category->attachments;
                @endphp

                <div class="space-y-2 mb-4">
                    @forelse($arquivos as $file)
                        <a
                            href="{{ $file->url }}"
                            target="_blank"
                            class="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                            <x-heroicon-o-document class="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span class="truncate">{{ $file->nome }}</span>
                            <span class="text-xs text-gray-400 ml-auto flex-shrink-0">{{ $file->created_at->format('d/m/Y') }}</span>
                        </a>
                    @empty
                        <p class="text-sm text-gray-500 dark:text-gray-400">Nenhum arquivo nesta aba{{ $mesAtual ? ' para o mês selecionado' : '' }}.</p>
                    @endforelse
                </div>

                {{-- Upload para esta aba --}}
                @if(!$readonly)
                <div x-data="{ open: false }" class="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <button
                        type="button"
                        @click="open = !open"
                        class="flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 font-medium"
                    >
                        <x-heroicon-o-arrow-up-tray class="w-4 h-4" />
                        Enviar arquivos
                    </button>

                    <div x-show="open" x-transition class="mt-3" style="display:none;">
                        <form
                            method="POST"
                            action="{{ route('order-attachment.store') }}"
                            enctype="multipart/form-data"
                            data-ajax
                        >
                            @csrf
                            <input type="hidden" name="order_id" value="{{ $orderId }}">
                            <input type="hidden" name="order_document_category_id" value="{{ $category->id }}">

                            <x-file-upload name="files[]" :multiple="true" />

                            <div class="flex gap-2 mt-3">
                                <button
                                    type="submit"
                                    class="px-4 py-1.5 text-sm bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition"
                                >
                                    Enviar
                                </button>
                                <button
                                    type="button"
                                    @click="open = false"
                                    class="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                @endif

            </div>
        @endforeach

    </div>

</x-card>
