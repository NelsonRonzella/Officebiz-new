<button
    {{ $attributes->merge([
        'type' => 'submit',
        'class' =>
            'inline-flex items-center px-4 py-2 rounded-md font-semibold text-sm text-black 
             transition-all duration-200 hover:brightness-110 shadow'
    ]) }}
    style="background-color: #FF9D00;"
>
    {{ $slot }}
</button>