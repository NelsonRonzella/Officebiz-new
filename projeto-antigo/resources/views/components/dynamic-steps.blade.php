@props([
    'initial' => []
])

<div
    x-data="{
        steps: @js($initial),
        errors: [],

        addStep() {
            if (!this.validateAll()) return;
            this.steps.push({ titulo: '', descricao: '', tempo: '', ordem: '' });
            this.errors.push({ titulo: '', descricao: '', tempo: '', ordem: '' });
        },

        removeStep(index) {
            this.steps.splice(index, 1);
            this.errors.splice(index, 1);
        },

        validateAll() {
            this.errors = this.steps.map(step => ({
                titulo:   !step.titulo   ? 'Obrigatório' : '',
                descricao: !step.descricao ? 'Obrigatório' : '',
                tempo:    (step.tempo === '' || step.tempo === null || step.tempo === undefined) ? 'Obrigatório' : '',
                ordem:    (step.ordem === '' || step.ordem === null || step.ordem === undefined) ? 'Obrigatório' : '',
            }));
            return this.errors.every(e => !e.titulo && !e.descricao && !e.tempo && !e.ordem);
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

<template x-for="(step, index) in steps" :key="index">

<div class="border dark:border-gray-700 rounded p-4 space-y-2 bg-gray-50 dark:bg-gray-800">

<div class="flex justify-between">
<strong x-text="'Etapa ' + (index + 1)" class="dark:text-gray-100"></strong>

<button
type="button"
@click="removeStep(index)"
class="text-red-500 hover:text-red-700"
data-cy="btn-remover-etapa"
>
<x-heroicon-o-trash class="w-5 h-5"/>
</button>

</div>

<div class="flex flex-col w-full">
<x-input label="Título" x-model="step.titulo" x-bind:class="errors[index]?.titulo ? 'border-red-500' : ''" data-cy="step-titulo"/>
<p x-show="errors[index]?.titulo" x-text="errors[index]?.titulo" class="text-red-500 text-xs mt-1"></p>
</div>

<div class="flex flex-col w-full">
<x-input label="Descrição" x-model="step.descricao" x-bind:class="errors[index]?.descricao ? 'border-red-500' : ''" data-cy="step-descricao"/>
<p x-show="errors[index]?.descricao" x-text="errors[index]?.descricao" class="text-red-500 text-xs mt-1"></p>
</div>

<div class="flex flex-col w-full">
<x-input label="Tempo da etapa" x-model="step.tempo"
    x-bind:class="errors[index]?.tempo ? 'border-red-500' : ''"
    x-on:input="$event.target.value = $event.target.value.replace(/\D/g, ''); step.tempo = $event.target.value"
    data-cy="step-tempo"
/>
<p x-show="errors[index]?.tempo" x-text="errors[index]?.tempo" class="text-red-500 text-xs mt-1"></p>
</div>

<div class="flex flex-col w-full">
<x-input label="Ordenação" x-model="step.ordem"
    x-bind:class="errors[index]?.ordem ? 'border-red-500' : ''"
    x-on:input="$event.target.value = $event.target.value.replace(/\D/g, ''); step.ordem = $event.target.value"
    data-cy="step-ordem"
/>
<p x-show="errors[index]?.ordem" x-text="errors[index]?.ordem" class="text-red-500 text-xs mt-1"></p>
</div>

</div>

</template>

<x-primary-button type="button" @click="addStep()" data-cy="btn-adicionar-etapa">
+ Adicionar etapa
</x-primary-button>

<input type="hidden" name="etapas" :value="JSON.stringify(steps)">

</div>
