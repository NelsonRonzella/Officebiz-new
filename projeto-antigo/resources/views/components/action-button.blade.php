@props([
    'color'    => 'blue',
    'href'     => null,
    'type'     => 'button',
    'disabled' => false,
])

@php
$colors = [
    'blue'   => 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50',
    'red'    => 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50',
    'green'  => 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50',
    'yellow' => 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50',
    'gray'   => 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500',
];

$base       = 'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md';
$colorClass = $disabled ? $colors['gray'] : ($colors[$color] ?? $colors['blue']);
@endphp

@if($href && !$disabled)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => "$base $colorClass"]) }}>
        {{ $slot }}
    </a>
@else
    <button
        type="{{ $type }}"
        {{ $disabled ? 'disabled' : '' }}
        {{ $attributes->merge(['class' => "$base $colorClass"]) }}
    >
        {{ $slot }}
    </button>
@endif
