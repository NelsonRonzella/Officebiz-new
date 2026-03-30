@props(['label' => null, 'name' => null])

@php
    $hasError = $name && $errors->has($name);
    $borderClass = $hasError
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500';
@endphp

<div class="flex flex-col w-full">

    @if ($label)
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $label }}
        </label>
    @endif

    <input
        name="{{ $name }}"
        {{ $attributes->merge([
            'class' => 'w-full rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ' . $borderClass
        ]) }}
    />

    @if ($hasError)
        <p class="text-red-500 text-xs mt-1">{{ $errors->first($name) }}</p>
    @endif

</div>
