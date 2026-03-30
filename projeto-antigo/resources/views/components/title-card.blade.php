<div class="bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
    <div class="p-6">

        {{-- Título --}}
        <div data-cy="page-title" class="text-gray-900 dark:text-gray-100 font-semibold text-lg">
            {{ $title }}
        </div>

        {{-- Breadcrumb --}}
        @if(isset($breadcrumb))
            <div class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {{ $breadcrumb }}
            </div>
        @endif

    </div>
</div>
