<x-user-list-page
    title="Administradores"
    breadcrumb="Home > Administradores"
    :create-route="route('usuarios.create', 'admin')"
    create-label="+ Cadastrar administrador"
    :users="$users"
/>
