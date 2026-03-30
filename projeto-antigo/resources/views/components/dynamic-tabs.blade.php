@props([
    'initial' => []
])

<div
    x-data="{
        tabs: @js($initial),
        errors: [],

        addTab() {
            if (!this.validateAll()) return;
            this.tabs.push({ titulo: '', descricao: '', ordem: this.tabs.length + 1 });
            this.errors.push({ titulo: '', descricao: '', ordem: '' });
        },

        removeTab(index) {
            this.tabs.splice(index, 1);
            this.errors.splice(index, 1);
        },

        validateAll() {
            this.errors = this.tabs.map(tab => ({
                titulo:    !tab.titulo    ? 'Obrigatório' : '',
                descricao: !tab.descricao ? 'Obrigatório' : '',
                ordem:     (tab.ordem === '' || tab.ordem === null || tab.ordem === undefined) ? 'Obrigatório' : '',
            }));
            return this.errors.every(e => !e.titulo && !e.descricao && !e.ordem);
        }
    }"
    x-init="
        $el.closest('form').addEventListener('submit', (e) => {
            if (!validateAll()) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }, true);
    "
    class="space-y-4"
>

    {{-- LISTA DE ABAS --}}
    <template x-for="(tab, index) in tabs" :key="index">

        <div class="border dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-800">

            <div class="flex justify-between mb-2">
                <strong x-text="tab.titulo || ('Aba ' + (index + 1))" class="dark:text-gray-100"></strong>

                <button
                    type="button"
                    class="text-red-500 hover:text-red-700"
                    @click="removeTab(index)"
                    data-cy="btn-remover-aba"
                >
                    <x-heroicon-o-trash class="w-5 h-5" />
                </button>
            </div>

            <div class="flex flex-col w-full">
                <x-input label="Título" x-model="tab.titulo" x-bind:class="errors[index]?.titulo ? 'border-red-500' : ''" data-cy="tab-titulo" />
                <p x-show="errors[index]?.titulo" x-text="errors[index]?.titulo" class="text-red-500 text-xs mt-1"></p>
            </div>

            <div class="flex flex-col w-full">
                <x-input label="Descrição" x-model="tab.descricao" x-bind:class="errors[index]?.descricao ? 'border-red-500' : ''" data-cy="tab-descricao" />
                <p x-show="errors[index]?.descricao" x-text="errors[index]?.descricao" class="text-red-500 text-xs mt-1"></p>
            </div>

            <div class="flex flex-col w-full">
                <x-input label="Ordenação" x-model="tab.ordem"
                    x-bind:class="errors[index]?.ordem ? 'border-red-500' : ''"
                    x-on:input="$event.target.value = $event.target.value.replace(/\D/g, ''); tab.ordem = $event.target.value"
                    data-cy="tab-ordem"
                />
                <p x-show="errors[index]?.ordem" x-text="errors[index]?.ordem" class="text-red-500 text-xs mt-1"></p>
            </div>

        </div>

    </template>

    {{-- ADICIONAR ABA --}}
    <x-primary-button type="button" @click="addTab()" data-cy="btn-adicionar-aba">
        + Adicionar aba
    </x-primary-button>

    {{-- HIDDEN PARA ENVIO --}}
    <input type="hidden" name="abas" :value="JSON.stringify(tabs)">

</div>
