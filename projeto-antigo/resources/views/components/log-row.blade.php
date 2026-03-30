<tr class="border-b dark:border-gray-600 dark:text-gray-100">

    {{-- Número --}}
    <td class="px-4 py-3">
        {{ $log->id }}
    </td>

    {{-- Ação --}}
    <td class="px-4 py-3">
        {{ $log->description }}
    </td>

    {{-- Model --}}
    <td class="px-4 py-3">
        {{ class_basename($log->subject_type) }}
    </td>

    {{-- Id da Model --}}
    <td class="px-4 py-3">
        {{ $log->subject_id ?? '-' }}
    </td>

    {{-- Descrição --}}
    <td class="px-4 py-3">
        {{ $log->log_name ?? '-' }}
    </td>

    {{-- Usuário --}}
    <td class="px-4 py-3">
        {{ $log->causer?->name ?? 'Sistema' }}
    </td>

    {{-- Data --}}
    <td class="px-4 py-3">
        {{ $log->created_at->format('d/m/Y H:i') }}
    </td>

</tr>