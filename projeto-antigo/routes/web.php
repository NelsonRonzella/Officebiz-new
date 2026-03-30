<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ContratoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\OrderAttachmentController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderMessageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TutorialController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Página Inicial — redireciona para login
|--------------------------------------------------------------------------
*/
Route::get('/', fn () => redirect()->route('login'));

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Autenticado — acesso geral (todos os papéis)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    // Notificações
    Route::prefix('notificacoes')->name('notificacoes.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/{id}/ler', [NotificationController::class, 'markAsRead'])->name('ler');
        Route::post('/ler-todas', [NotificationController::class, 'markAllAsRead'])->name('ler-todas');
    });

    // Push subscriptions (PWA)
    Route::post('/push/subscribe', [PushSubscriptionController::class, 'subscribe'])->name('push.subscribe');
    Route::post('/push/unsubscribe', [PushSubscriptionController::class, 'unsubscribe'])->name('push.unsubscribe');

    // Downloads de arquivos (acessível a todos os usuários autenticados)
    Route::get('/order-attachments/{attachment}/download', [OrderAttachmentController::class, 'download'])->name('order-attachment.download');
    Route::get('/order-messages/{message}/download', [OrderMessageController::class, 'download'])->name('order-message.download');

    // Pedidos — visualização (qualquer usuário logado)
    // Nota: /pedidos/novo deve ser registrado ANTES de /pedidos/{id} para evitar conflito
    Route::get('/pedidos', [OrderController::class, 'index'])->name('pedidos');
    Route::get('/pedidos/novo', [OrderController::class, 'create'])
        ->middleware('role:admin,licenciado')->name('cadastrar-pedido');
    Route::get('/pedidos/{id}', [OrderController::class, 'show'])->name('detalhes-pedido');

    // Tutoriais e Produtos — somente leitura
    Route::get('/tutoriais', [TutorialController::class, 'index'])->name('tutoriais');
    Route::get('/produtos', [ProductController::class, 'index'])->name('produtos');
    Route::get('/produtos/{id}/visualizar', [ProductController::class, 'show'])->name('produto.visualizar');


    // Dashboards por papel
    Route::get('/dashboard/licenciado', fn () => view('dashboard-licenciado'))
        ->middleware('role:licenciado')->name('dashboard-licenciado');
    Route::get('/dashboard/cliente', fn () => view('dashboard-cliente'))
        ->middleware('role:cliente')->name('dashboard-cliente');
    Route::get('/dashboard/prestador', fn () => view('dashboard-prestador'))
        ->middleware('role:prestador')->name('dashboard-prestador');
});

/*
|--------------------------------------------------------------------------
| Admin e Licenciado — criação de pedidos
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin,licenciado'])->group(function () {
    Route::post('/pedidos', [OrderController::class, 'store'])->name('pedido.store');
});

/*
|--------------------------------------------------------------------------
| Admin, Licenciado e Prestador — interação com pedidos
| (clientes só visualizam, nunca modificam)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin,licenciado,prestador'])->group(function () {
    Route::post('/pedidos/{id}/mensagem', [OrderController::class, 'storeMessage'])->name('pedido.mensagem.store');
    Route::post('/pedidos/{id}/avancar-etapa', [OrderController::class, 'avancarEtapa'])->name('pedidos.avancarEtapa');
    Route::post('/order-attachments', [OrderAttachmentController::class, 'store'])->name('order-attachment.store');
    Route::post('/order-messages', [OrderMessageController::class, 'store'])->name('order-message.store');
});

/*
|--------------------------------------------------------------------------
| Prestador — aceitar pedido atribuído
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:prestador'])->group(function () {
    Route::patch('/pedido/{id}/aceitar', [OrderController::class, 'aceitar'])->name('pedido.aceitar');
});

/*
|--------------------------------------------------------------------------
| Admin e Licenciado — gestão de clientes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin,licenciado'])->group(function () {
    Route::get('/clientes', [UserController::class, 'clientes'])->name('clientes');
    Route::get('/usuarios/{role}/novo', [RegisteredUserController::class, 'create'])->name('usuarios.create');
    Route::post('/clientes', [RegisteredUserController::class, 'store'])->name('clientes.store');
    Route::get('/clientes/{id}', fn ($id) => view('cadastrar-cliente', ['id' => $id]))->name('cliente-id');
    Route::get('/usuarios/{id}/editar', [UserController::class, 'edit'])->name('usuarios.edit');
    Route::put('/usuarios/{id}', [UserController::class, 'update'])->name('usuarios.update');
});

/*
|--------------------------------------------------------------------------
| Somente Admin
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])->group(function () {

    // Dashboard e relatórios
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/financeiro', [FinanceController::class, 'index'])->name('financeiro');
    Route::get('/log', [LogController::class, 'index'])->name('log');
    Route::get('/sobre', fn () => view('sobre'))->name('sobre');

    // API interna do dashboard
    Route::get('/api/dashboard/faturamento', [DashboardController::class, 'faturamentoMensal']);
    Route::get('/api/dashboard/pedidos-dia', [DashboardController::class, 'pedidosPorDia']);

    // Pedidos — ações administrativas
    Route::put('/pedidos/{id}', [OrderController::class, 'update'])->name('pedido.update');
    Route::patch('/pedido/{id}/cancelar', [OrderController::class, 'cancelar'])->name('pedido.cancelar');
    Route::patch('/pedido/{id}/prestador', [OrderController::class, 'trocarPrestador'])->name('pedido.trocar-prestador');
    Route::patch('/pedido/{id}/pago', [OrderController::class, 'marcarPago'])->name('pedido.pago');
    Route::patch('/pedido/{id}/retorno', [OrderController::class, 'marcarRetorno'])->name('pedido.retorno');
    Route::patch('/pedido/{id}/concluir', [OrderController::class, 'concluir'])->name('pedido.concluir');

    // Usuários — cadastro e edição (admin-only)
    Route::get('/administradores', [UserController::class, 'administradores'])->name('administradores');
    Route::get('/licenciados', [UserController::class, 'licenciados'])->name('licenciados');
    Route::get('/prestadores', [UserController::class, 'prestadores'])->name('prestadores');
    Route::patch('/usuarios/{id}/toggle', [UserController::class, 'toggle'])->name('usuarios.toggle');

    // Produtos — gerenciamento completo
    Route::get('/produtos/pontual/novo', [ProductController::class, 'createPontual'])->name('cadastrar-produto-pontual');
    Route::get('/produtos/recorrente/novo', [ProductController::class, 'createRecorrente'])->name('cadastrar-produto-recorrente');
    Route::post('/produtos', [ProductController::class, 'store'])->name('produto.store');
    Route::get('/produtos/{id}/editar', [ProductController::class, 'edit'])->name('produto.editar');
    Route::put('/produtos/{id}', [ProductController::class, 'update'])->name('produto.update');
    Route::patch('/produtos/{id}/toggle', [ProductController::class, 'toggle'])->name('produto.toggle');

    // Tutoriais — gerenciamento
    Route::post('/tutoriais', [TutorialController::class, 'store'])->name('tutorial.store');
    Route::delete('/tutoriais/{id}', [TutorialController::class, 'destroy'])->name('tutorial.destroy');

    // Contratos
    Route::get('/contratos', [ContratoController::class, 'index'])->name('contratos');
    Route::post('/contratos/upload', [ContratoController::class, 'upload'])->name('contratos.upload');
    Route::get('/contratos/download/{arquivo}', [ContratoController::class, 'download'])->name('contratos.download');
});
