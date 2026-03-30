<x-card>

    <form method="POST"
        action="{{ route('pedido.mensagem.store', $orderId) }}"
        enctype="multipart/form-data"
        data-ajax>

        @csrf

        <textarea
            name="mensagem"
            class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg min-h-[140px] p-3 focus:border-blue-400 focus:ring-blue-400 mb-3"
            placeholder="Escreva uma mensagem..."
        ></textarea>

        <x-file-upload name="file" label="Arraste ou selecione um arquivo (opcional)" />

        <div class="flex justify-end mt-3">
            <button
                type="submit"
                data-cy="btn-enviar"
                class="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition">
                Enviar
            </button>
        </div>

    </form>

</x-card>
