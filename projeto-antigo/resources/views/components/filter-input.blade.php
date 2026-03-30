@props(['name', 'type' => 'text', 'placeholder' => ''])

<input
    type="{{ $type }}"
    name="{{ $name }}"
    placeholder="{{ $placeholder }}"
    value="{{ request($name) }}"
    {{ $attributes->merge(['class' => 'border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200']) }}
/>
