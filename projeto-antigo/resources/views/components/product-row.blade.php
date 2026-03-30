@php
    $role = Auth::user()->role ?? null;
@endphp

<tr class="border-b dark:border-gray-600 dark:text-gray-100">

    <td class="px-4 py-3">
        <a href="{{ route('produto.visualizar', $product->id) }}" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            #{{ $product->id }}
        </a>
    </td>

    <td class="px-4 py-3">
        {{ $product->name }}
    </td>

    <td class="px-4 py-3">
        {{ ucfirst($product->type) }}
    </td>

    <td class="px-4 py-3">
        <x-active-badge :active="$product->active" />
    </td>

    <td class="px-4 py-3">
        @if(in_array($role, ['admin']))
            <div class="flex flex-wrap items-center gap-2">

                <x-action-button color="blue" :href="route('produto.editar', $product->id)">
                    <x-heroicon-o-pencil class="w-3.5 h-3.5"/>
                    Editar
                </x-action-button>

                <form method="POST" action="{{ route('produto.toggle', $product->id) }}" data-ajax>
                    @csrf
                    @method('PATCH')

                    @if($product->active)
                        <x-action-button color="yellow" type="submit">
                            <x-heroicon-o-eye-slash class="w-3.5 h-3.5"/>
                            Desativar
                        </x-action-button>
                    @else
                        <x-action-button color="green" type="submit">
                            <x-heroicon-o-eye class="w-3.5 h-3.5"/>
                            Ativar
                        </x-action-button>
                    @endif
                </form>

            </div>
        @else
            -
        @endif
    </td>

</tr>
