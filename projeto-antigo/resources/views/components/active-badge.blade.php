@props(['active'])

@if($active)
    <span class="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded">
        Ativo
    </span>
@else
    <span class="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded">
        Inativo
    </span>
@endif
