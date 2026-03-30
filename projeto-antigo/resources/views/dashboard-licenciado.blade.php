<x-app-layout>
    <div class="space-y-6">
        {{-- Card de título --}}
        <x-title-card 
            title="Dashboard" 
            breadcrumb="Home" 
        />

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <x-product-card 
                titulo="Registro de marca"
                descricao="Tudo venentatis ipsum ac feugiat. Vestibulum ullamcorper quam."
                tutorial="#"
                contratar="#"
            />

            <x-product-card 
                titulo="Contabilidade"
                descricao="Tudo venentatis ipsum ac feugiat. Vestibulum ullamcorper quam."
            />

            <x-product-card 
                titulo="Marcas e patentes"
                descricao="Tudo venentatis ipsum ac feugiat. Vestibulum ullamcorper quam."
            />

            <x-product-card titulo="Registro de marca" />
            <x-product-card titulo="Registro de marca" />
            <x-product-card titulo="Registro de marca" />

        </div>
    </div>
</x-app-layout>
