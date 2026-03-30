@props([
    'value' => '0',
    'label' => 'Descrição',
    // pode ser string (nome do ícone) ou o retorno de svg(...)
    'icon' => null,
    'color' => 'red', // red, yellow, blue
])

@php
$colors = [
    'red' => 'text-red-500',
    'yellow' => 'text-yellow-500',
    'blue' => 'text-blue-500',
];

$bgColors = [
    'red' => 'bg-red-500',
    'yellow' => 'bg-yellow-500',
    'blue' => 'bg-blue-500',
];

$textColor = $colors[$color] ?? 'text-gray-500';
$barColor = $bgColors[$color] ?? 'bg-gray-300';

/**
 * Renderiza o ícone de forma segura:
 * - se $icon for um objeto Htmlable/Svg, transforma em HTML
 * - se for string, chama svg($icon, $classes)
 * - senão, vazio
 */
$iconHtml = '';
if ($icon) {
    // Htmlable interface (toHtml)
    if (is_object($icon) && method_exists($icon, 'toHtml')) {
        $iconHtml = $icon->toHtml();
    }
    // BladeUI\Icons\Svg tem método render() ou toHtml(); teste generico:
    elseif (is_object($icon) && method_exists($icon, 'render')) {
        $iconHtml = $icon->render();
    }
    // se for string, chame helper svg()
    elseif (is_string($icon)) {
        try {
            $iconHtml = svg($icon, 'w-8 h-8');
        } catch (\Throwable $e) {
            $iconHtml = '';
        }
    }
}
@endphp

<div class="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-4 relative overflow-hidden
            hover:shadow-md transition">

    {{-- Linha inferior colorida --}}
    <div class="absolute bottom-0 left-0 w-full h-[3px] {{ $barColor }}"></div>

    <div class="flex items-center justify-between">

        {{-- Texto --}}
        <div>
            <div class="text-2xl text-gray-900 dark:text-gray-100">
                {{ $value }}
            </div>

            <div class="mt-2 text-sm {{ $textColor }}">
                {{ $label }}
            </div>
        </div>

        {{-- Ícone à direita --}}
        <div class="flex items-center {{ $textColor }}">
            {!! $iconHtml !!}
        </div>

    </div>
</div>
