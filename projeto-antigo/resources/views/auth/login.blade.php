<x-guest-layout>

    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('E-mail')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="mt-4">
            <x-input-label for="password" :value="__('Senha')" />
            <x-text-input id="password" class="block mt-1 w-full"
                type="password"
                name="password"
                required autocomplete="current-password" />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Remember Me + Forgot Password -->
        <div class="flex justify-between items-center mt-4">
            <label for="remember_me" class="inline-flex items-center">
                <input id="remember_me" type="checkbox"
                    class="rounded border-gray-300 text-brand focus:ring-brand"
                    name="remember">
                <span class="ms-2 text-sm text-gray-600">Lembrar nesse dispositivo</span>
            </label>

            @if (Route::has('password.request'))
                <a class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md"
                    href="{{ route('password.request') }}">
                    Esqueceu a senha?
                </a>
            @endif
        </div>

        <!-- Botão Entrar (100% width + cor #FF9D00) -->
        <div class="mt-6">
            <x-primary-button class="w-full justify-center">
                Entrar
            </x-primary-button>
        </div>

        <!-- Não é licenciado + especialista -->
        <div class="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span>Não é licenciado?</span>

            <a class="underline hover:text-gray-900 rounded-md focus:outline-none">
                Fale com um especialista.
            </a>
        </div>

    </form>
</x-guest-layout>
