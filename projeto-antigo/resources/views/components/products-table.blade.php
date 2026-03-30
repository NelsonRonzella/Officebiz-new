@props(['products'])

<x-table :headers="['ID','Nome','Tipo','Status','Ações']">

    @forelse($products as $product)

    <x-product-row :product="$product"/>

    @empty

<tr>
    <td colspan="5" class="text-center py-6 dark:text-gray-400">
        Nenhum produto encontrado
    </td>
</tr>

@endforelse

</x-table>