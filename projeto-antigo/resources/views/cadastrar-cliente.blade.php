@php
    use Illuminate\Support\Js;

    $roleFromUrl = request()->route('role');

    $mapRoles = [
        'clientes'    => 'cliente',
        'prestadores' => 'prestador',
        'licenciados' => 'licenciado',
        'admin'       => 'admin'
    ];

    $tipoUsuario   = $mapRoles[$roleFromUrl] ?? 'cliente';
    $editando      = isset($user);
    $tipoDocumento = ($editando && !empty($user->cnpj)) ? 'cnpj' : 'cpf';
@endphp

<script>
    window._userFormData = {{ Js::from([
        'tipo'     => $tipoDocumento,
        'cpf'      => old('cpf',      $user->cpf      ?? ''),
        'cnpj'     => old('cnpj',     $user->cnpj     ?? ''),
        'telefone' => old('telefone', $user->telefone  ?? ''),
        'cep'      => old('cep',      $user->cep      ?? ''),
        'endereco' => old('endereco', $user->endereco  ?? ''),
        'bairro'   => old('bairro',   $user->bairro   ?? ''),
        'cidade'   => old('cidade',   $user->cidade   ?? ''),
        'estado'   => old('estado',   $user->estado   ?? ''),
    ]) }};
</script>

<x-app-layout>

    <div class="space-y-8">

        <x-title-card
            :title="$editando ? 'Editar Usuário' : 'Novo Usuário'"
            breadcrumb="Home > Usuários"
        />

        <x-card>

            <h2 class="text-lg font-semibold mb-6">
                {{ $editando ? 'Editar usuário' : 'Cadastro de usuário' }}
            </h2>

            <form
                method="POST"
                action="{{ $editando ? route('usuarios.update', $user->id) : route('clientes.store') }}"
                class="space-y-6"
                x-data="userForm(window._userFormData)"
                data-ajax
            >
                @csrf

                @if($editando)
                    @method('PUT')
                @endif

                {{-- Tipo de usuário --}}
                <div class="flex flex-col">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de usuário</label>
                    <select name="role"
                        data-cy="select-role"
                        class="w-full rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="admin"     {{ old('role', $user->role ?? $tipoUsuario) == 'admin'      ? 'selected' : '' }}>Administrador</option>
                        <option value="cliente"   {{ old('role', $user->role ?? $tipoUsuario) == 'cliente'    ? 'selected' : '' }}>Cliente</option>
                        <option value="prestador" {{ old('role', $user->role ?? $tipoUsuario) == 'prestador'  ? 'selected' : '' }}>Prestador</option>
                        @if(Auth::user()->isAdmin())
                            <option value="licenciado" {{ old('role', $user->role ?? $tipoUsuario) == 'licenciado' ? 'selected' : '' }}>Licenciado</option>
                        @endif
                    </select>
                    @error('role')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                {{-- CPF / CNPJ toggle --}}
                <div class="flex items-center gap-6">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tipo" value="cpf" x-model="tipo"> CPF
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tipo" value="cnpj" x-model="tipo"> CNPJ
                    </label>
                </div>

                {{-- Nome --}}
                <x-input
                    label="Nome"
                    name="name"
                    data-cy="input-nome"
                    :value="old('name', $user->name ?? '')"
                />

                {{-- WhatsApp + E-mail + CPF/CNPJ --}}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div class="flex flex-col w-full">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                        <input type="hidden" name="telefone" :value="telefoneVal">
                        <input
                            type="text"
                            inputmode="numeric"
                            placeholder="(00) 00000-0000"
                            data-cy="input-telefone"
                            x-init="$el.value = telefoneVal"
                            @input="maskTelefone($event)"
                            class="w-full rounded-md shadow-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                        >
                    </div>

                    <x-input
                        label="E-mail"
                        name="email"
                        data-cy="input-email"
                        :value="old('email', $user->email ?? '')"
                    />

                    {{-- CPF --}}
                    <div x-show="tipo === 'cpf'">
                        <div class="flex flex-col w-full">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF</label>
                            <input type="hidden" name="cpf" :value="cpfVal">
                            <input
                                type="text"
                                inputmode="numeric"
                                placeholder="000.000.000-00"
                                x-init="$el.value = cpfVal"
                                @input="maskCpf($event)"
                                :class="{
                                    'border-green-500 focus:ring-green-500 focus:border-green-500': cpfValido() === true,
                                    'border-red-500   focus:ring-red-500   focus:border-red-500':   cpfValido() === false,
                                    'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500': cpfValido() === null
                                }"
                                class="w-full rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                            <p x-show="cpfValido() === false" class="text-red-500 text-xs mt-1">CPF inválido</p>
                            <p x-show="cpfValido() === true"  class="text-green-600 text-xs mt-1">✓ CPF válido</p>
                        </div>
                    </div>

                    {{-- CNPJ --}}
                    <div x-show="tipo === 'cnpj'">
                        <div class="flex flex-col w-full">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
                            <input type="hidden" name="cnpj" :value="cnpjVal">
                            <input
                                type="text"
                                inputmode="numeric"
                                placeholder="00.000.000/0000-00"
                                x-init="$el.value = cnpjVal"
                                @input="maskCnpj($event)"
                                :class="{
                                    'border-green-500 focus:ring-green-500 focus:border-green-500': cnpjValido() === true,
                                    'border-red-500   focus:ring-red-500   focus:border-red-500':   cnpjValido() === false,
                                    'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500': cnpjValido() === null
                                }"
                                class="w-full rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                            <p x-show="cnpjValido() === false" class="text-red-500 text-xs mt-1">CNPJ inválido</p>
                            <p x-show="cnpjValido() === true"  class="text-green-600 text-xs mt-1">✓ CNPJ válido</p>
                        </div>
                    </div>

                </div>

                {{-- CEP --}}
                <div class="flex flex-col w-full">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CEP</label>
                    <div class="relative">
                        <input type="hidden" name="cep" :value="cepVal">
                        <input
                            type="text"
                            inputmode="numeric"
                            placeholder="00000-000"
                            x-init="$el.value = cepVal"
                            @input="maskCep($event)"
                            class="w-full rounded-md shadow-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                        >
                        <span
                            x-show="cepLoading"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none"
                        >Buscando...</span>
                    </div>
                    <p x-show="cepNotFound" class="text-red-500 text-xs mt-1">CEP não encontrado</p>
                </div>

                {{-- Endereço --}}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="md:col-span-2">
                        <x-input label="Endereço" name="endereco" x-model="endereco" />
                    </div>
                    <div>
                        <x-input
                            label="Número"
                            name="numero"
                            :value="old('numero', $user->numero ?? '')"
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <x-input label="Bairro"  name="bairro"  x-model="bairro"  />
                    <x-input label="Cidade"  name="cidade"  x-model="cidade"  />
                    <x-input label="Estado"  name="estado"  x-model="estado"  />
                </div>

                {{-- Senha --}}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <x-input label="Senha"           type="password" name="password"              data-cy="input-senha" />
                    <x-input label="Confirmar senha" type="password" name="password_confirmation" data-cy="input-confirmar-senha" />
                </div>

                <div class="flex justify-end pt-4">
                    <x-primary-button data-cy="{{ $editando ? 'btn-atualizar' : 'btn-criar' }}">
                        {{ $editando ? 'Atualizar' : 'Criar' }}
                    </x-primary-button>
                </div>

            </form>

        </x-card>

    </div>

</x-app-layout>
