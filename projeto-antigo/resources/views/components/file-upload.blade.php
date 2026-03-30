@props([
    'name'     => 'file',
    'multiple' => false,
    'accept'   => null,
    'label'    => null,
])

@php
    $label    = $label ?? ($multiple ? 'Arraste ou selecione arquivos' : 'Arraste ou selecione um arquivo');
    $onChange = $multiple
        ? 'files = [...files, ...$event.target.files]'
        : 'files = $event.target.files[0] ? [$event.target.files[0]] : []';
    $onDrop   = $multiple
        ? 'files = [...files, ...$event.dataTransfer.files]'
        : 'files = $event.dataTransfer.files[0] ? [$event.dataTransfer.files[0]] : []';
@endphp

<div x-data="{ files: [], dragging: false }">

    <label
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="dragging = false; {{ $onDrop }}"
        :class="dragging ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400'"
        class="flex flex-col items-center justify-center gap-1 w-full border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition"
    >
        <x-heroicon-o-paper-clip class="w-6 h-6 text-gray-400" />
        <span class="text-xs text-gray-500 dark:text-gray-400 text-center">
            {{ $label }}
        </span>
        <input
            type="file"
            name="{{ $name }}"
            {{ $multiple ? 'multiple' : '' }}
            {{ $accept ? "accept={$accept}" : '' }}
            class="hidden"
            @change="{{ $onChange }}"
        >
    </label>

    <template x-if="files.length > 0">
        <ul class="space-y-1 mt-2">
            <template x-for="(file, i) in files" :key="i">
                <li class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                    <x-heroicon-o-document class="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span class="flex-1 truncate" x-text="file.name"></span>
                    <button
                        type="button"
                        @click="files = files.filter((_, j) => j !== i)"
                        class="text-red-400 hover:text-red-600 flex-shrink-0"
                    >
                        <x-heroicon-o-x-mark class="w-3 h-3" />
                    </button>
                </li>
            </template>
        </ul>
    </template>

</div>
