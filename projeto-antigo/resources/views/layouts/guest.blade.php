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
        <meta name="apple-mobile-web-app-title" content="Officebiz">
        <link rel="apple-touch-icon" href="/icons/web-app-manifest-192x192.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans text-gray-900 antialiased">
        <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <div class="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div class="mb-5 flex justify-center">
                    <a href="/">
                        <x-application-logo class="w-20 h-20 fill-current text-gray-500" />
                    </a>
                </div>
            
                {{ $slot }}
            </div>
        </div>

    {{-- Banner de instalação do PWA --}}
    <div
        id="pwa-install-banner"
        style="display:none; position:fixed; bottom:1rem; left:50%; transform:translateX(-50%); z-index:9999;
               background:#FF9D00; color:#fff; padding:0.75rem 1.25rem; border-radius:0.75rem;
               box-shadow:0 4px 16px rgba(0,0,0,0.2); align-items:center; gap:0.75rem; max-width:90vw;"
    >
        <span style="font-size:0.9rem; font-weight:500;">Instalar o Officebiz no seu dispositivo?</span>
        <button
            onclick="(async()=>{ if(!_pwaInstallPrompt) return; _pwaInstallPrompt.prompt(); const {outcome} = await _pwaInstallPrompt.userChoice; _pwaInstallPrompt=null; document.getElementById('pwa-install-banner').style.display='none'; })()"
            style="background:#fff; color:#FF9D00; font-weight:700; border:none; border-radius:0.5rem; padding:0.4rem 0.9rem; cursor:pointer; font-size:0.85rem;"
        >Instalar</button>
        <button
            onclick="document.getElementById('pwa-install-banner').style.display='none'"
            style="background:transparent; color:#fff; border:none; cursor:pointer; font-size:1.1rem; line-height:1;"
            aria-label="Fechar"
        >&times;</button>
    </div>

    <script>
        let _pwaInstallPrompt = null;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            _pwaInstallPrompt = e;
            const banner = document.getElementById('pwa-install-banner');
            if (banner) banner.style.display = 'flex';
        });

        window.addEventListener('appinstalled', () => {
            _pwaInstallPrompt = null;
            const banner = document.getElementById('pwa-install-banner');
            if (banner) banner.style.display = 'none';
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }
    </script>
    </body>
</html>
