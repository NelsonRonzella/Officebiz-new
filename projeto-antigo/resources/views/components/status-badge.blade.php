<span class="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full {{ $type->color() }}">
    <x-dynamic-component :component="'heroicon-s-'.$type->icon()" class="w-4 h-4" />
    {{ $type->label() }}
</span>