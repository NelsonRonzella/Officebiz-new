<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Página Não Encontrada</title>
    <script>
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }
    </script>
    @vite(['resources/css/app.css'])
</head>
<body class="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
    <div class="text-center px-6">
        <p class="text-6xl font-bold text-blue-500 mb-4">404</p>
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Página não encontrada</h1>
        <p class="text-gray-500 dark:text-gray-400 mb-8">O endereço que você tentou acessar não existe.</p>
        <a href="{{ auth()->check() ? route('pedidos') : route('login') }}"
           class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
            Ir para o início
        </a>
    </div>
</body>
</html>
