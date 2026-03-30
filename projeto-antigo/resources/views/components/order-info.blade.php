@props([
    'product',
    'progress' => 0,
    'steps',
    'order',
    'cliente',
    'email',
    'telefone',
    'endereco',
    'cidade'
])

@php
    $role = Auth::user()->role ?? null;
    $isPontual = $order->product->type === \App\Models\Product::TYPE_PONTUAL;
@endphp

<x-card>

    <h2 class="text-lg font-semibold mb-1 dark:text-gray-100">
        {{ $product }}
    </h2>
    <span class="inline-block text-xs px-2 py-0.5 rounded-full mb-3 {{ $isPontual ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' }}">
        {{ $isPontual ? 'Pontual' : 'Recorrente' }}
    </span>

    {{-- progresso (apenas pontual) --}}
    @if($isPontual)
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Progresso
        </p>

        <br>

        <x-progress-bar :value="$progress" />

        <br>
        <hr class="dark:border-gray-700">
    @endif

    {{-- Status --}}
    <div class="mt-4">

        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
            Status
        </p>

        <p class="text-gray-700 dark:text-gray-200 flex items-center gap-2 mt-1">
            <span class="w-2 h-2 bg-yellow-400 rounded-full"></span>
            {{ $order->status->label() }}
        </p>
    </div>

    {{-- etapas (apenas pontual) --}}
    @if($isPontual)
        <div class="mt-4">

            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2 flex items-center gap-1">
                Etapas
                <span class="relative group inline-flex cursor-help">
                    <x-heroicon-o-exclamation-circle class="w-4 h-4 text-yellow-500" />
                    <span class="pointer-events-none absolute left-5 top-0 z-20 hidden group-hover:block w-72 rounded-lg bg-gray-800 px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-lg">
                        As etapas poderão ser avançadas assim que o pedido passar pro status EM ANDAMENTO
                    </span>
                </span>
            </p>

            <ul class="space-y-2">

                @foreach($steps as $step)

                    <li class="flex items-center gap-2 dark:text-gray-200">

                        @if($step->finished_at)

                            <span class="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>

                        @elseif($order->current_step_id === $step->id)

                            <span class="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>

                        @else

                            <span class="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full flex-shrink-0"></span>

                        @endif

                        {{ $step->title }}

                    </li>

                @endforeach

            </ul>

            @if(
                $order->isEmAndamento() &&
                $order->current_step_id &&
                $order->prestador &&
                in_array($role,['admin','licenciado', 'prestador'])
            )

                <form
                    method="POST"
                    action="{{ route('pedidos.avancarEtapa', $order->id) }}"
                    class="mt-4"
                >

                    @csrf

                    <button
                        type="submit"
                        data-cy="btn-avancar-etapa"
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Avançar etapa
                    </button>

                </form>

            @endif

        </div>
    @endif

    {{-- Prestador --}}
    @php
        $prestadorId = $order->getRawOriginal('prestador');
        $prestadorNome = $prestadorId ? \App\Models\User::find($prestadorId)?->name : null;
    @endphp
    <div class="mt-4">
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Prestador</p>
        <p class="text-gray-700 dark:text-gray-200 text-sm">
            {{ $prestadorNome ?? 'Nenhum' }}
        </p>

        @if($role === 'admin')
            <div x-data="{ open: false }" class="mt-2">
                <button
                    type="button"
                    data-cy="btn-trocar-prestador"
                    @click="open = !open"
                    class="text-xs text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 font-medium flex items-center gap-1"
                >
                    <x-heroicon-o-pencil-square class="w-3.5 h-3.5" />
                    Trocar prestador
                </button>

                <div x-show="open" x-transition class="mt-2" style="display:none;">
                    <form
                        method="POST"
                        action="{{ route('pedido.trocar-prestador', $order->id) }}"
                        data-ajax
                    >
                        @csrf
                        @method('PATCH')
                        <select
                            name="prestador_id"
                            class="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-blue-400 focus:ring-blue-400 mb-2"
                        >
                            <option value="">Nenhum</option>
                            @foreach(\App\Models\User::where('role','prestador')->where('active',true)->get() as $p)
                                <option value="{{ $p->id }}" @selected($order->getRawOriginal('prestador') == $p->id)>
                                    {{ $p->name }}
                                </option>
                            @endforeach
                        </select>
                        <div class="flex gap-2">
                            <button type="submit" data-cy="btn-salvar-prestador" class="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition">
                                Salvar
                            </button>
                            <button type="button" @click="open = false" class="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        @endif
    </div>

    {{-- cliente --}}
    <div class="mt-6 space-y-3 text-gray-700 dark:text-gray-200">

        <p class="flex items-center gap-2">
            <x-heroicon-o-user class="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
            {{ $cliente }}
        </p>

        <p class="flex items-center gap-2">
            <x-heroicon-o-envelope class="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
            {{ $email }}
        </p>

        <p class="flex items-center gap-2">
            <x-heroicon-o-phone class="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
            {{ $telefone }}
        </p>

        <p class="flex items-center gap-2">
            <x-heroicon-o-map-pin class="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
            {{ $endereco }}
        </p>

        <p class="flex items-center gap-2">
            <x-heroicon-o-map-pin class="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
            {{ $cidade }}
        </p>

    </div>

</x-card>
