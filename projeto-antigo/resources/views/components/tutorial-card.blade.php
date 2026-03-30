@props([
    'id',
    'image',
    'titulo',
    'descricao',
    'link'
])

<div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border dark:border-gray-700" data-deletable data-cy="tutorial-card">

<img
    src="{{ $image }}"
    class="w-full h-48 object-cover"
>

<div class="p-4 space-y-3">

<h3 class="text-lg font-semibold dark:text-gray-100">
    {{ $titulo }}
</h3>

<p class="text-sm text-gray-600 dark:text-gray-400">
    {{ $descricao }}
</p>

<div class="flex justify-between items-center">

@php
    $role = Auth::user()->role ?? null;
@endphp

@if($role === 'admin')

<form
    method="POST"
    action="{{ route('tutorial.destroy',$id) }}"
    data-ajax-delete
    data-confirm-message="Tem certeza que deseja excluir este tutorial?"
>

@csrf
@method('DELETE')

<button
    type="submit"
    class="text-red-600 flex items-center"
>

<x-heroicon-o-trash class="w-5 h-5 mr-1"/>

Excluir

</button>

</form>

@endif

<a
    href="{{ $link }}"
    target="_blank"
    class="text-blue-600 font-semibold"
>

Ver tutorial

</a>

</div>

</div>

</div>