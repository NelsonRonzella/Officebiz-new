@props(['files', 'orderId' => null, 'readonly' => false])

<x-card>
    <h2 class="text-lg font-semibold mb-4 dark:text-gray-100">Arquivos Anexados</h2>

    {{-- Lista de arquivos --}}
    <div class="space-y-2 mb-4">
        @forelse ($files as $file)
            <a
                href="{{ $file->url }}"
                target="_blank"
                class="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
                <x-heroicon-o-document class="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span class="truncate">{{ $file->nome }}</span>
            </a>
        @empty
            <p class="text-sm text-gray-500 dark:text-gray-400">Nenhum arquivo anexado.</p>
        @endforelse
    </div>

    {{-- Formulário de upload (só aparece quando orderId é passado e pedido não é readonly) --}}
    @if($orderId && !$readonly)
        <div x-data="{ open: false }" class="border-t border-gray-100 dark:border-gray-700 pt-4">

            <button
                type="button"
                data-cy="btn-abrir-upload"
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

                    <x-file-upload name="files[]" :multiple="true" />

                    <div class="flex gap-2 mt-3">
                        <button
                            type="submit"
                            data-cy="btn-enviar-arquivo"
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

</x-card>
