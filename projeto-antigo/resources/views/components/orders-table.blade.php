@props(['orders'])

<x-table :headers="['N°', 'Criado Por', 'Cliente', 'Produto', 'Status', 'Progresso', 'Data de criação', 'Ações']">

    @foreach ($orders as $order)
        <x-order-row :order="$order" />
    @endforeach

</x-table>
