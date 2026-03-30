<x-app-layout>

<div class="space-y-6">

<x-title-card 
    title="Tutoriais"
    breadcrumb="Home > Tutoriais"
/>

@php
    $role = Auth::user()->role ?? null;
@endphp


@if($role === 'admin')

<form method="POST" action="{{ route('tutorial.store') }}" data-ajax>

@csrf

<x-card title="Cadastrar tutorial">

<x-input
    name="title"
    label="Título"
    class="mb-4"
/>

<x-input
    name="description"
    label="Descrição"
    class="mb-4"
/>

<x-input
    name="link"
    label="Link do YouTube"
    class="mb-4"
/>

<div class="mb-4">

<label class="block text-sm font-medium mb-2">
Produtos relacionados
</label>

<select
    name="products[]"
    multiple
    class="w-full border rounded p-2"
>

@foreach($products as $product)

<option value="{{ $product->id }}">
    {{ $product->name }}
</option>

@endforeach

</select>

<p class="text-sm text-gray-500 mt-2">
Segure CTRL para selecionar mais de um
</p>

</div>

<x-primary-button data-cy="btn-cadastrar">
    Cadastrar
</x-primary-button>

</x-card>

</form>

@endif


<x-card title="Tutoriais">

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

@foreach($tutorials as $tutorial)

<x-tutorial-card
    :id="$tutorial->id"
    :titulo="$tutorial->title"
    :descricao="$tutorial->description"
    :image="$tutorial->youtube_thumbnail"
    :link="$tutorial->link"
/>

@endforeach

</div>

<div class="mt-6">

{{ $tutorials->links() }}

</div>

</x-card>

</div>

</x-app-layout>