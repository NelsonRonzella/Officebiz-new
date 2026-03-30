@props(['users'])

<x-table :headers="['ID','Usuário','Status','Ações']">

    @foreach ($users as $user)

        <x-user-row :user="$user" />

    @endforeach

</x-table>

{{ $users->links() }}