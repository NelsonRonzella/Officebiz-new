@props([
    'type',
    'product'   => null,
    'steps'     => [],
    'abas'      => [],
    'tutorials' => [],
])

@php
    $isEdit       = isset($product) && $product !== null;
    $sectionLabel = $type === 'pontual' ? 'Etapas' : 'Abas de documentos';
    $titleLabel   = $isEdit ? 'Editar produto' : 'Novo produto ' . $type;
    $breadcrumb   = 'Home > Produtos ' . ($type === 'pontual' ? 'pontuais' : 'recorrentes');
@endphp

<x-app-layout>

    <form
        method="POST"
        action="{{ $isEdit ? route('produto.update', $product->id) : route('produto.store') }}"
        data-ajax
    >
        @csrf
        @if($isEdit) @method('PUT') @endif

        <input type="hidden" name="type" value="{{ $type }}">

        <div class="space-y-8">

            <x-validation-errors />

            <x-title-card :title="$titleLabel" :breadcrumb="$breadcrumb" />

            <x-product-details :product="$product" />

            <x-card>
                <h2 class="text-lg font-semibold mb-4 dark:text-gray-100">
                    {{ $sectionLabel }}
                </h2>

                @if($type === 'pontual')
                    <x-dynamic-steps :initial="$steps" />
                @else
                    <x-dynamic-tabs :initial="$abas" />
                @endif
            </x-card>

            <x-product-tutorial :tutorials="$tutorials" :selected="$product->tutorials ?? []" />

            <div class="flex justify-end">
                <x-primary-button data-cy="btn-salvar">Salvar</x-primary-button>
            </div>

        </div>
    </form>

</x-app-layout>
