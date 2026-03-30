@php
    $tag = $attributes->has('href') ? 'a' : 'button';
@endphp

<{{ $tag }}
    {{ $attributes->merge([
        'class' =>
            'inline-flex items-center px-4 py-2 rounded-md font-semibold text-sm text-black 
            transition-all duration-200 shadow hover:shadow-md hover:-translate-y-0.5 transform',
    ]) }}
>
    {{ $slot }}
</{{ $tag }}>

