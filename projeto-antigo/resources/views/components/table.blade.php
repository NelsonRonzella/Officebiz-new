<div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-md">

    <div class="p-0 overflow-x-auto">
        <table class="w-full border-collapse">

            {{-- Cabeçalho --}}
            <thead>
                <tr class="bg-white dark:bg-gray-700 text-left text-gray-600 dark:text-gray-300 text-sm uppercase border-b border-gray-200 dark:border-gray-600">
                    @foreach ($headers as $header)
                        <th class="px-4 py-3">
                            {{ $header }}
                        </th>
                    @endforeach
                </tr>
            </thead>

            {{-- Corpo --}}
            <tbody class="bg-white dark:bg-gray-700">
                {{ $slot }}
            </tbody>

        </table>
    </div>

</div>
