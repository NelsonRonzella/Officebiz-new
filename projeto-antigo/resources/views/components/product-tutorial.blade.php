@props(['tutorials'])

<x-card>

<h2 class="text-lg font-semibold mb-4 dark:text-gray-100">
Tutoriais
</h2>

<select
name="tutorials[]"
multiple
class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2"
>

@foreach($tutorials as $tutorial)

<option value="{{ $tutorial->id }}">
{{ $tutorial->title }}
</option>

@endforeach

</select>

<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
Segure CTRL para selecionar mais de um
</p>

</x-card>