<x-app-layout>
    <div class="space-y-6">

        <x-title-card
            title="Contratos"
            breadcrumb="Home > Contratos"
        />

        <x-card title="Upload de contrato">

            <form
                action="{{ route('contratos.upload') }}"
                method="POST"
                enctype="multipart/form-data"
                data-ajax
            >
                @csrf

                <x-file-upload name="contrato" />

                <div class="flex justify-end mt-4">
                    <button
                        type="submit"
                        class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                    >
                        Enviar contrato
                    </button>
                </div>

            </form>

        </x-card>

        <x-card title="Contratos enviados">

            <div class="space-y-2">

                @forelse($arquivos as $arquivo)

                    <a
                        href="{{ route('contratos.download', $arquivo['nome']) }}"
                        class="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                        <x-heroicon-o-document class="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span class="truncate">{{ $arquivo['nome'] }}</span>
                    </a>

                @empty

                    <p class="text-sm text-gray-500 dark:text-gray-400">Nenhum contrato enviado.</p>

                @endforelse

            </div>

        </x-card>

    </div>
</x-app-layout>
