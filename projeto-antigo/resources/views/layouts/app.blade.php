<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <link rel="icon" href="/favicon.png" type="image/png">
    <link rel="shortcut icon" href="/favicon.png" type="image/png">

    {{-- PWA --}}
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#FF9D00">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Officebiz">
    <link rel="apple-touch-icon" href="/icons/web-app-manifest-192x192.png">
    <meta name="vapid-key" content="{{ config('webpush.vapid.public_key') }}">

    {{-- Aplica dark mode antes de renderizar (evita flash) --}}
    <script>
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }
    </script>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="font-sans antialiased">

    <div
        x-data="{
            darkMode: localStorage.getItem('darkMode') === 'true',
            sidebarOpen: window.innerWidth >= 640,
            toggleDark() {
                this.darkMode = !this.darkMode;
                localStorage.setItem('darkMode', this.darkMode);
                document.documentElement.classList.toggle('dark', this.darkMode);
            }
        }"
        class="flex h-screen overflow-hidden bg-white dark:bg-gray-900"
    >

        {{-- Overlay mobile (fecha sidebar ao clicar fora) --}}
        <div
            x-show="sidebarOpen"
            @click="sidebarOpen = false"
            class="fixed inset-0 bg-black/40 z-20 sm:hidden"
            x-transition:enter="transition-opacity duration-200"
            x-transition:enter-start="opacity-0"
            x-transition:enter-end="opacity-100"
            x-transition:leave="transition-opacity duration-200"
            x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0"
            style="display:none;"
        ></div>

        {{-- SIDEBAR --}}
        @include('layouts.sidebar')

        {{-- CONTEÚDO --}}
        <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">

            {{-- Topbar --}}
            <div class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between">

                {{-- Hamburger (mobile) --}}
                <button
                    @click="sidebarOpen = !sidebarOpen"
                    class="sm:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                    <x-heroicon-o-bars-3 class="w-6 h-6" />
                </button>

                <div class="flex items-center gap-4 ml-auto">

                    {{-- Modo escuro --}}
                    <button @click="toggleDark()" data-cy="btn-toggle-dark" class="flex items-center justify-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors">
                        <template x-if="!darkMode">
                            <x-heroicon-o-moon class="w-6 h-6" />
                        </template>
                        <template x-if="darkMode">
                            <x-heroicon-o-sun class="w-6 h-6" />
                        </template>
                    </button>

                    {{-- Notificações --}}
                    <div
                        x-data="{
                            open: false,
                            notifications: [],
                            unread: 0,
                            loading: false,
                            async load() {
                                this.loading = true;
                                const r = await fetch('/notificacoes');
                                const d = await r.json();
                                this.notifications = d.notifications;
                                this.unread = d.unread_count;
                                this.loading = false;
                            },
                            async markRead(id) {
                                const csrf = document.querySelector('meta[name=csrf-token]').content;
                                await fetch('/notificacoes/' + id + '/ler', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf } });
                                const notif = this.notifications.find(item => item.id === id);
                                if (notif && !notif.lida) { notif.lida = true; this.unread = Math.max(0, this.unread - 1); }
                            },
                            async markAllRead() {
                                const csrf = document.querySelector('meta[name=csrf-token]').content;
                                await fetch('/notificacoes/ler-todas', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf } });
                                this.notifications.forEach(item => item.lida = true);
                                this.unread = 0;
                            }
                        }"
                        x-init="load()"
                        class="relative"
                    >
                        <button
                            @click="open = !open"
                            data-cy="btn-notificacoes"
                            class="relative flex items-center justify-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                        >
                            <x-heroicon-o-bell class="w-6 h-6" />
                            <template x-if="unread > 0">
                                <span
                                    class="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold bg-blue-500 text-white rounded-full"
                                    x-text="unread > 9 ? '9+' : unread"
                                ></span>
                            </template>
                        </button>

                        <div
                            x-show="open"
                            @click.outside="open = false"
                            x-transition:enter="transition ease-out duration-150"
                            x-transition:enter-start="opacity-0 scale-95"
                            x-transition:enter-end="opacity-100 scale-100"
                            x-transition:leave="transition ease-in duration-100"
                            x-transition:leave-start="opacity-100 scale-100"
                            x-transition:leave-end="opacity-0 scale-95"
                            data-cy="painel-notificacoes"
                            class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden"
                            style="display: none;"
                        >
                            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                <span class="font-semibold text-sm text-gray-800 dark:text-gray-100">Notificações</span>
                                <button @click="markAllRead()" x-show="unread > 0" class="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300">
                                    Marcar todas como lidas
                                </button>
                            </div>
                            <div class="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                                <template x-if="loading">
                                    <div class="p-5 text-center text-sm text-gray-400">Carregando...</div>
                                </template>
                                <template x-if="!loading && notifications.length === 0">
                                    <div class="p-6 text-center text-sm text-gray-400 dark:text-gray-500">Sem notificações</div>
                                </template>
                                <template x-for="notif in notifications" :key="notif.id">
                                    <a
                                        :href="notif.url"
                                        @click.prevent="markRead(notif.id); window.location.href = notif.url"
                                        class="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        :class="notif.lida ? 'opacity-60' : ''"
                                    >
                                        <div class="flex-shrink-0 pt-1.5">
                                            <span class="block w-2 h-2 rounded-full" :class="notif.lida ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'"></span>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-medium text-gray-800 dark:text-gray-100" x-text="notif.titulo"></p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5" x-text="notif.mensagem"></p>
                                            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1" x-text="notif.criada_em"></p>
                                        </div>
                                    </a>
                                </template>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {{-- Conteúdo da página --}}
            <div class="flex-1 py-8">
                <div class="w-full max-w-6xl mx-auto px-6">

                    @isset($header)
                        <header class="mb-6">{{ $header }}</header>
                    @endisset

                    {{ $slot }}

                </div>
            </div>

        </div>
    </div>

@stack('scripts')

<script>
    // Captura o evento de instalação do PWA para exibir prompt customizado
    let _pwaInstallPrompt = null;

    // Registra o service worker e solicita permissão de notificação push
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js').then(async (registration) => {
            const vapidKey = document.querySelector('meta[name=vapid-key]')?.content
            if (!vapidKey) return

            // Já tem subscription ativa? Não pede de novo
            const existing = await registration.pushManager.getSubscription()
            if (existing) return

            // Pede permissão ao usuário
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') return

            // Assina o push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            })

            // Envia a subscription para o servidor
            await fetch('/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content,
                },
                body: JSON.stringify(subscription.toJSON()),
            })
        })
    } else if ('serviceWorker' in navigator) {
        // Sem push, registra só para o PWA funcionar
        navigator.serviceWorker.register('/sw.js')
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
        const rawData = atob(base64)
        return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
    }
</script>
</body>
</html>
