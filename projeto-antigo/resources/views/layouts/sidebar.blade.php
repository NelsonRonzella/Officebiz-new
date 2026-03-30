@php
    use Illuminate\Support\Facades\Auth;

    $role = Auth::user()->role ?? null;

    $menus = [
        'admin' => [
            'dashboard', 'pedidos', 'financeiro', 'log',
            'clientes', 'administradores', 'licenciados', 'prestadores',
            'tutoriais', 'contratos', 'produtos', 'sobre',
        ],
        'cliente'    => ['pedidos', 'tutoriais', 'produtos'],
        'licenciado' => ['pedidos', 'clientes', 'tutoriais', 'produtos'],
        'prestador'  => ['pedidos', 'tutoriais', 'produtos'],
    ];

    $can = fn ($menu) => in_array($menu, $menus[$role] ?? []);

    // Role do usuário sendo editado (para destacar o item correto do menu na edição)
    $editandoRole = null;
    if (request()->routeIs('usuarios.edit')) {
        $editandoId = request()->route('id');
        $editandoRole = \App\Models\User::find($editandoId)?->role;
    }
@endphp

{{-- Sidebar: fixo no mobile (overlay), relativo no desktop --}}
<div
    class="fixed sm:relative inset-y-0 left-0 z-30 sm:z-auto
           flex flex-col h-full w-60 flex-shrink-0
           bg-white dark:bg-gray-900 border-r dark:border-gray-700 shadow
           transition-all duration-300 overflow-y-auto"
    :class="{
        '-translate-x-full sm:translate-x-0': !sidebarOpen,
        'translate-x-0': sidebarOpen,
        'sm:w-60': sidebarOpen,
        'sm:w-20': !sidebarOpen
    }"
>

    <!-- LOGO + BOTÃO DE COLAPSO -->
    <div class="flex items-center justify-between px-3 py-3 flex-shrink-0">
        <a href="{{ route('dashboard') }}" class="flex items-center">
            <div x-show="sidebarOpen">
                <x-application-logo class="block h-8 w-auto text-gray-600" />
            </div>
            <div x-show="!sidebarOpen" class="hidden sm:flex justify-center w-full">
                <img src="/favicon.png" class="w-8 h-8 object-contain" alt="Logo" />
            </div>
        </a>
        <button
            @click="sidebarOpen = !sidebarOpen"
            class="hidden sm:flex text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition p-1 rounded"
        >
            <x-heroicon-o-bars-3 class="w-6 h-6" />
        </button>
    </div>

    <!-- MENU -->
    <nav class="flex-1 px-2 space-y-1 overflow-y-auto">

        {{-- FERRAMENTAS --}}
        <div
            class="text-black dark:text-gray-400 font-bold uppercase tracking-wide text-xs"
            :class="sidebarOpen ? 'px-1 py-0.5 mt-4' : 'hidden'"
        >
            Ferramentas
        </div>

        {{-- Dashboard --}}
        @if($can('dashboard'))
        @php $active = request()->routeIs('dashboard'); @endphp
        <a href="{{ route('dashboard') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-squares-2x2 class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Dashboard</span>
        </a>
        @endif

        {{-- Pedidos --}}
        @if($can('pedidos'))
        @php $active = request()->is('pedidos*'); @endphp
        <a href="{{ route('pedidos') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-chart-pie class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Pedidos</span>
        </a>
        @endif

        {{-- Financeiro --}}
        @if($can('financeiro'))
        @php $active = request()->is('financeiro*'); @endphp
        <a href="{{ route('financeiro') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-currency-dollar class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Financeiro</span>
        </a>
        @endif

        {{-- Log --}}
        @if($can('log'))
        @php $active = request()->is('log*'); @endphp
        <a href="{{ route('log') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-list-bullet class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Log</span>
        </a>
        @endif

        {{-- USUÁRIOS --}}
        @if($can('clientes') || $can('administradores') || $can('licenciados') || $can('prestadores'))
        <div
            class="text-black dark:text-gray-400 font-bold uppercase tracking-wide text-xs"
            :class="sidebarOpen ? 'px-1 py-0.5 mt-4' : 'hidden'"
        >
            Usuários
        </div>
        @endif

        {{-- Clientes --}}
        @if($can('clientes'))
        @php $active = request()->is('clientes*') || request()->is('usuarios/clientes/*') || $editandoRole === 'cliente'; @endphp
        <a href="{{ route('clientes') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-user class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Clientes</span>
        </a>
        @endif

        {{-- Administradores --}}
        @if($can('administradores'))
        @php $active = request()->is('administradores*') || request()->is('usuarios/admin/*') || $editandoRole === 'admin'; @endphp
        <a href="{{ route('administradores') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-users class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Administradores</span>
        </a>
        @endif

        {{-- Licenciados --}}
        @if($can('licenciados'))
        @php $active = request()->is('licenciados*') || request()->is('usuarios/licenciados/*') || $editandoRole === 'licenciado'; @endphp
        <a href="{{ route('licenciados') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-briefcase class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Licenciados</span>
        </a>
        @endif

        {{-- Prestadores --}}
        @if($can('prestadores'))
        @php $active = request()->is('prestadores*') || request()->is('usuarios/prestadores/*') || $editandoRole === 'prestador'; @endphp
        <a href="{{ route('prestadores') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-wrench-screwdriver class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Prestadores</span>
        </a>
        @endif

        {{-- CONFIGURAÇÕES --}}
        @if($can('tutoriais') || $can('contratos') || $can('produtos'))
        <div
            class="text-black dark:text-gray-400 font-bold uppercase tracking-wide text-xs"
            :class="sidebarOpen ? 'px-1 py-0.5 mt-4' : 'hidden'"
        >
            Configurações
        </div>
        @endif

        {{-- Tutoriais --}}
        @if($can('tutoriais'))
        @php $active = request()->is('tutoriais*'); @endphp
        <a href="{{ route('tutoriais') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-academic-cap class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Tutoriais</span>
        </a>
        @endif

        {{-- Contratos --}}
        @if($can('contratos'))
        @php $active = request()->is('contratos*'); @endphp
        <a href="{{ route('contratos') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-document-check class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Contratos</span>
        </a>
        @endif

        {{-- Produtos --}}
        @if($can('produtos'))
        @php $active = request()->is('produtos*'); @endphp
        <a href="{{ route('produtos') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-cube class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Produtos</span>
        </a>
        @endif

        {{-- Sobre --}}
        @if($can('sobre'))
        @php $active = request()->is('sobre*'); @endphp
        <a href="{{ route('sobre') }}"
            class="flex items-center transition rounded-lg
            {{ $active ? 'bg-[#FF9D00] text-black' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700' }}"
            :class="sidebarOpen ? 'p-1.5' : 'p-2 justify-center'"
        >
            <x-heroicon-o-information-circle class="w-5 h-5 flex-shrink-0" />
            <span x-show="sidebarOpen" class="ml-2 truncate text-sm">Sobre</span>
        </a>
        @endif

    </nav>


    {{-- USUÁRIO / LOGOUT --}}
    <div class="mt-auto p-3 flex-shrink-0">

        <div
            x-show="sidebarOpen"
            class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 flex items-center space-x-2"
        >
            <x-heroicon-o-user-circle class="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div class="flex-1 min-w-0">
                <div class="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
                    {{ Auth::user()->name ?? 'Usuário' }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ Auth::user()->role }}
                </div>
            </div>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button class="text-orange-500 hover:text-orange-600">
                    <x-heroicon-o-power class="w-5 h-5" />
                </button>
            </form>
        </div>

        <div x-show="!sidebarOpen" class="hidden sm:flex justify-center">
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button class="text-orange-500 hover:text-orange-600 p-2 rounded-lg">
                    <x-heroicon-o-power class="w-6 h-6" />
                </button>
            </form>
        </div>

    </div>
</div>
