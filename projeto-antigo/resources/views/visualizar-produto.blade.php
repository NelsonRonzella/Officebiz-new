<x-app-layout>

    <div class="space-y-6">

        <x-title-card
            title="Produto #{{ $product->id }}"
            breadcrumb="Home > Produtos > #{{ $product->id }}"
        />

        {{-- Dados principais --}}
        <x-card title="Informações do Produto">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">

                <div>
                    <dt class="font-medium text-gray-500 dark:text-gray-400">Nome</dt>
                    <dd class="mt-1 text-gray-900 dark:text-gray-100">{{ $product->name }}</dd>
                </div>

                <div>
                    <dt class="font-medium text-gray-500 dark:text-gray-400">Tipo</dt>
                    <dd class="mt-1 text-gray-900 dark:text-gray-100">{{ ucfirst($product->type) }}</dd>
                </div>

                <div>
                    <dt class="font-medium text-gray-500 dark:text-gray-400">Preço</dt>
                    <dd class="mt-1 text-gray-900 dark:text-gray-100">
                        R$ {{ number_format($product->price, 2, ',', '.') }}
                    </dd>
                </div>

                <div>
                    <dt class="font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd class="mt-1">
                        <x-active-badge :active="$product->active" />
                    </dd>
                </div>

                @if($product->description)
                <div class="sm:col-span-2">
                    <dt class="font-medium text-gray-500 dark:text-gray-400">Descrição</dt>
                    <dd class="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-line">{{ $product->description }}</dd>
                </div>
                @endif

            </dl>
        </x-card>

        {{-- Etapas (produto pontual) --}}
        @if($product->steps->isNotEmpty())
        <x-card title="Etapas">
            <ol class="space-y-3">
                @foreach($product->steps->sortBy('order') as $step)
                <li class="flex gap-4 text-sm">
                    <span class="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                        {{ $loop->iteration }}
                    </span>
                    <div>
                        <p class="font-medium text-gray-900 dark:text-gray-100">{{ $step->title }}</p>
                        @if($step->description)
                            <p class="text-gray-500 dark:text-gray-400 mt-0.5">{{ $step->description }}</p>
                        @endif
                        @if($step->duration_days)
                            <p class="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                                Prazo: {{ $step->duration_days }} {{ $step->duration_days == 1 ? 'dia' : 'dias' }}
                            </p>
                        @endif
                    </div>
                </li>
                @endforeach
            </ol>
        </x-card>
        @endif

        {{-- Abas de documentos (produto recorrente) --}}
        @if($product->documentCategories->isNotEmpty())
        <x-card title="Categorias de Documentos">
            <ul class="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                @foreach($product->documentCategories as $category)
                <li class="py-3">
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ $category->title }}</p>
                    @if($category->description)
                        <p class="text-gray-500 dark:text-gray-400 mt-0.5">{{ $category->description }}</p>
                    @endif
                </li>
                @endforeach
            </ul>
        </x-card>
        @endif

        {{-- Tutoriais vinculados --}}
        @if($product->tutorials->isNotEmpty())
        <x-card title="Tutoriais">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach($product->tutorials as $tutorial)
                    <x-tutorial-card
                        :id="$tutorial->id"
                        :titulo="$tutorial->title"
                        :descricao="$tutorial->description"
                        :image="$tutorial->youtube_thumbnail"
                        :link="$tutorial->link"
                    />
                @endforeach
            </div>
        </x-card>
        @endif

        @if($product->tutorials->isEmpty() && $product->steps->isEmpty() && $product->documentCategories->isEmpty())
            <x-card>
                <p class="text-sm text-gray-500 dark:text-gray-400">Nenhuma informação adicional cadastrada para este produto.</p>
            </x-card>
        @endif

    </div>

</x-app-layout>
