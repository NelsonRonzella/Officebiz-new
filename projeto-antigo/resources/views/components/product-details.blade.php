@props(['product' => null])

<x-card>

<h2 class="text-lg font-semibold mb-4 dark:text-gray-100">
Detalhes do produto
</h2>

<x-input
label="Nome do produto"
name="name"
value="{{ $product->name ?? '' }}"
class="mb-4"
/>

<x-input
label="Descrição"
name="description"
value="{{ $product->description ?? '' }}"
class="mb-4"
/>

<x-input
label="Valor cobrado para o licenciado"
name="price"
value="{{ $product->price ?? '' }}"
x-data
x-on:input="
    let v = $event.target.value.replace(/[^\d,]/g, '');
    let parts = v.split(',');
    if (parts.length > 2) parts = [parts[0], parts.slice(1).join('')];
    if (parts[1] !== undefined) parts[1] = parts[1].slice(0, 2);
    $event.target.value = parts.join(',');
"
placeholder="0,00"
/>

</x-card>