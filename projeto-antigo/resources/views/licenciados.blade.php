<x-user-list-page
    title="Licenciados"
    breadcrumb="Home > Licenciados"
    :create-route="route('usuarios.create', 'licenciados')"
    create-label="+ Cadastrar licenciado"
    :users="$users"
/>
