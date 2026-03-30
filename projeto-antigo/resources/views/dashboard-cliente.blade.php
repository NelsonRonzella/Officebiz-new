<x-app-layout>

    <div class="space-y-6">

        <x-title-card
            title="Meus Pedidos"
            breadcrumb="Home > Pedidos"
        />

        <x-primary-button-link :href="route('pedidos')">
            Ver meus pedidos
        </x-primary-button-link>

    </div>

</x-app-layout>
