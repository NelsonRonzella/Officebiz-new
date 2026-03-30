@props(['order'])

@php
    $role = Auth::user()->role ?? null;
@endphp

<tr class="border-b dark:border-gray-600 dark:text-gray-100">

    {{-- Número --}}
    <td class="px-4 py-3">
        <a
            href="{{ route('detalhes-pedido', $order->id) }}"
            class="text-blue-600 hover:underline"
        >
            {{ $order->id }}
        </a>
    </td>

    {{-- Licenciado --}}
    <td class="px-4 py-3">
        {{ $order->criador->name }}<br>
        <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ $order->criador->email }}
        </span>
    </td>

    {{-- Cliente --}}
    <td class="px-4 py-3">
        {{ $order->user->name }}<br>
        <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ $order->user->email }}
        </span>
    </td>

    {{-- Produto --}}
    <td class="px-4 py-3">
        {{ $order->product->name }}
    </td>

    {{-- Status --}}
    <td class="px-4 py-3">
        <x-status-badge :type="$order->status" :label="$order->status_label" />
    </td>

    {{-- Progresso --}}
    <td class="px-4 py-3">
        @if($order->product->isRecorrente())
            <span class="text-xs text-gray-400 dark:text-gray-500">—</span>
        @else
            <x-progress-bar :value="$order->progresso" />
        @endif
    </td>

    <td class="px-4 py-3">
        {{ $order->created_at->format('d/m/Y H:i') }}
    </td>

    <td class="px-4 py-3">
        <div class="flex flex-wrap items-center gap-2">

        @if($role === 'admin')

            {{-- CANCELAR --}}
            <form method="POST" action="{{ route('pedido.cancelar', $order->id) }}">
                @csrf
                @method('PATCH')
                <x-action-button type="submit" color="red" data-cy="btn-cancelar" :disabled="$order->isCancelado() || $order->isConcluido()">
                    <x-heroicon-o-x-circle class="w-3.5 h-3.5"/>
                    Cancelar
                </x-action-button>
            </form>

            {{-- MARCAR COMO PAGO --}}
            @if($order->isAguardandoPagamento())
                <form method="POST" action="{{ route('pedido.pago', $order->id) }}">
                    @csrf
                    @method('PATCH')
                    <x-action-button type="submit" color="green" data-cy="btn-pago">
                        <x-heroicon-o-currency-dollar class="w-3.5 h-3.5"/>
                        Pago
                    </x-action-button>
                </form>
            @endif

            {{-- RETORNO --}}
            @if($order->isEmAndamento())
                <form method="POST" action="{{ route('pedido.retorno', $order->id) }}">
                    @csrf
                    @method('PATCH')
                    <x-action-button type="submit" color="yellow">
                        <x-heroicon-o-arrow-path class="w-3.5 h-3.5"/>
                        Retorno
                    </x-action-button>
                </form>
            @endif

            {{-- CONCLUIR --}}
            @if($order->isEmAndamento() || $order->isRetorno())
                <form method="POST" action="{{ route('pedido.concluir', $order->id) }}"
                    data-ajax-confirm
                    data-confirm-title="Concluir pedido"
                    data-confirm-message="Confirmar conclusão do pedido #{{ $order->id }}?"
                    data-confirm-btn="Sim, concluir"
                    data-confirm-color="#22c55e"
                >
                    @csrf
                    @method('PATCH')
                    <x-action-button type="submit" color="green" data-cy="btn-concluir">
                        <x-heroicon-o-check-circle class="w-3.5 h-3.5"/>
                        Concluir
                    </x-action-button>
                </form>
            @endif

        @elseif($role === 'prestador' && !$order->prestador && $order->isPago())

            {{-- ACEITAR --}}
            <form method="POST" action="{{ route('pedido.aceitar', $order->id) }}">
                @csrf
                @method('PATCH')
                <x-action-button type="submit" color="blue" data-cy="btn-aceitar">
                    <x-heroicon-o-check-circle class="w-3.5 h-3.5"/>
                    Aceitar
                </x-action-button>
            </form>

        @else
            -
        @endif

        </div>
    </td>
</tr>
