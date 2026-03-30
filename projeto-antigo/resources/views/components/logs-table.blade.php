@props(['logs'])

<x-table :headers="['N°', 'Ação', 'Model', 'Id da model', 'Descrição', 'Usuário', 'Data de criação']">

    @forelse ($logs as $log)
        <x-log-row :log="$log" />
    @empty
        <tr>
            <td colspan="7" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                Nenhum log encontrado
            </td>
        </tr>
    @endforelse

</x-table>