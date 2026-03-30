<x-user-list-page
    title="Prestadores"
    breadcrumb="Home > Prestadores"
    :create-route="route('usuarios.create', 'prestadores')"
    create-label="+ Cadastrar prestador"
    :users="$users"
/>
