@props([
    'title',
    'breadcrumb',
    'createRoute'  => null,
    'createLabel'  => null,
    'users',
])

@php $role = Auth::user()->role ?? null; @endphp

<x-app-layout>
    <div class="space-y-6">

        <x-title-card :title="$title" :breadcrumb="$breadcrumb" />

        @if($createRoute && in_array($role, ['admin', 'licenciado']))
            <x-primary-button-link :href="$createRoute" data-cy="link-criar">
                {{ $createLabel }}
            </x-primary-button-link>
        @endif

        <x-card :title="$title">
            <x-users-table :users="$users" />
        </x-card>

    </div>
</x-app-layout>
