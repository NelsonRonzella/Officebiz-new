<x-app-layout>

<div class="space-y-6 max-w-3xl mx-auto">

    <x-title-card
        title="Novo pedido"
        breadcrumb="Home > Pedidos > Novo"
    />

    <form
        method="POST"
        action="{{ route('pedido.store') }}"
        enctype="multipart/form-data"
        class="space-y-6"
        data-ajax
    >
        @csrf

        <x-validation-errors />

        {{-- Dados do pedido --}}
        <x-card title="Dados do pedido">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div class="space-y-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cliente <span class="text-red-500">*</span>
                    </label>
                    <select
                        name="user_id"
                        class="w-full border {{ $errors->has('user_id') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600' }} rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="">Selecione o cliente...</option>
                        @foreach($clients as $client)
                            <option value="{{ $client->id }}" {{ old('user_id') == $client->id ? 'selected' : '' }}>{{ $client->name }}</option>
                        @endforeach
                    </select>
                    @error('user_id')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="space-y-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Produto <span class="text-red-500">*</span>
                    </label>
                    <select
                        name="product_id"
                        class="w-full border {{ $errors->has('product_id') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600' }} rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="">Selecione o produto...</option>
                        @foreach($products as $product)
                            <option value="{{ $product->id }}" {{ old('product_id') == $product->id ? 'selected' : '' }}>{{ $product->name }}</option>
                        @endforeach
                    </select>
                    @error('product_id')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

            </div>
        </x-card>

        {{-- Mensagem inicial --}}
        <x-card title="Mensagem inicial">
            <textarea
                name="message"
                rows="5"
                placeholder="Escreva uma mensagem inicial para o pedido (opcional)..."
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            ></textarea>
        </x-card>

        {{-- Anexos --}}
        <x-card title="Anexos">
            <div
                x-data="{ files: [], dragging: false }"
                class="space-y-4"
            >
                {{-- Drop zone --}}
                <label
                    @dragover.prevent="dragging = true"
                    @dragleave.prevent="dragging = false"
                    @drop.prevent="dragging = false; files = [...files, ...$event.dataTransfer.files]"
                    :class="dragging ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400'"
                    class="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-6 py-10 cursor-pointer transition"
                >
                    <x-heroicon-o-arrow-up-tray class="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        Arraste arquivos aqui ou <span class="text-yellow-500 font-medium">clique para selecionar</span>
                    </span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">Múltiplos arquivos permitidos · Max 20MB cada</span>
                    <input
                        type="file"
                        name="files[]"
                        multiple
                        class="hidden"
                        @change="files = [...files, ...$event.target.files]"
                    >
                </label>

                {{-- Lista de arquivos selecionados --}}
                <template x-if="files.length > 0">
                    <ul class="space-y-2">
                        <template x-for="(file, index) in files" :key="index">
                            <li class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                                <x-heroicon-o-document class="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span class="flex-1 truncate" x-text="file.name"></span>
                                <button
                                    type="button"
                                    @click="files = files.filter((_, i) => i !== index)"
                                    class="text-red-400 hover:text-red-600 flex-shrink-0"
                                >
                                    <x-heroicon-o-x-mark class="w-4 h-4" />
                                </button>
                            </li>
                        </template>
                    </ul>
                </template>
            </div>
        </x-card>

        {{-- Ações --}}
        <div class="pb-4">
            <x-primary-button data-cy="btn-criar-pedido">
                Criar pedido
            </x-primary-button>
        </div>

    </form>

</div>

</x-app-layout>
