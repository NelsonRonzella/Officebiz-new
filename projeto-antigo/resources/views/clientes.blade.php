<x-user-list-page
    title="Clientes"
    breadcrumb="Home > Clientes"
    :create-route="route('usuarios.create', 'clientes')"
    create-label="+ Cadastrar cliente"
    :users="$users"
/>
