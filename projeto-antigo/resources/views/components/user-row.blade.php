<tr class="border-b dark:border-gray-600 dark:text-gray-100">

    <td class="px-4 py-3">
        {{ $user->id }}
    </td>

    <td class="px-4 py-3">
        {{ $user->name }}
        <br>
        <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ $user->email }}
        </span>
    </td>

    <td class="px-4 py-3">
        <x-active-badge :active="$user->active" />
    </td>

    <td class="px-4 py-3">
        <div class="flex flex-wrap items-center gap-2">

            <x-action-button color="blue" :href="route('usuarios.edit', $user->id)">
                <x-heroicon-o-pencil class="w-3.5 h-3.5"/>
                Editar
            </x-action-button>

            <form method="POST" action="{{ route('usuarios.toggle', $user->id) }}">
                @csrf
                @method('PATCH')

                @if($user->active)
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
    </td>

</tr>
