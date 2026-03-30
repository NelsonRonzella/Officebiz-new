<x-app-layout>
    <div class="space-y-6">
        {{-- Card de título --}}
        <x-title-card 
            title="Financeiro" 
            breadcrumb="Home > Financeiro" 
        />

        <x-card title="Pedidos pendentes de pagamento">
            <x-orders-table :orders="$orders" />
            
            <div class="mt-6">

                {{ $orders->links() }}

            </div>
        </x-card>
    </div>
</x-app-layout>
