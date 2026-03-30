<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatusEnum;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Notifications\AnexoAdicionadoNotification;
use App\Notifications\EtapaAvancadaNotification;
use App\Notifications\MensagemAdicionadaNotification;
use App\Notifications\PedidoCriadoNotification;
use App\Notifications\StatusAtualizadoNotification;
use App\Models\OrderPrestadorLog;
use App\Notifications\PrestadorVinculadoNotification;
use App\Services\NotificationService;
use App\Services\OrderDocumentCategoryService;
use App\Services\OrderProgressService;
use App\Services\OrderStepService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class OrderController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();

        $orders = Order::with([
            'user',
            'product',
            'criador'
        ])
        ->forUser($user)
        ->when($request->filled('numero'), fn($q) => $q->where('id', $request->numero))
        ->when($request->filled('cliente_nome'), fn($q) => $q->whereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->cliente_nome . '%')))
        ->when($request->filled('cliente_email'), fn($q) => $q->whereHas('user', fn($u) => $u->where('email', 'like', '%' . $request->cliente_email . '%')))
        ->when($request->filled('licenciado_nome'), fn($q) => $q->whereHas('criador', fn($u) => $u->where('name', 'like', '%' . $request->licenciado_nome . '%')))
        ->when($request->filled('prestador_nome'), fn($q) => $q->whereHas('prestador', fn($u) => $u->where('name', 'like', '%' . $request->prestador_nome . '%')))
        ->when($request->filled('tipo_produto'), fn($q) => $q->whereHas('product', fn($p) => $p->where('type', $request->tipo_produto)))
        ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
        ->when($request->filled('data_inicio'), fn($q) => $q->whereDate('created_at', '>=', $request->data_inicio))
        ->when($request->filled('data_fim'), fn($q) => $q->whereDate('created_at', '<=', $request->data_fim))
        ->latest()
        ->paginate(10)
        ->withQueryString();

        return view('pedidos', compact('orders'));
    }


    public function show(Request $request,$id)
    {
        $order = Order::with([
            'user',
            'product',
            'attachments',
            'steps',
            'documentCategories.attachments',
        ])->findOrFail($id);

        abort_unless($order->canBeViewedBy(Auth::user()), 403);

        $messages = $order->messages()
            ->with('user')
            ->when($request->data_inicio, fn($q)=>$q->whereDate('date','>=',$request->data_inicio))
            ->when($request->data_fim, fn($q)=>$q->whereDate('date','<=',$request->data_fim))
            ->when($request->search,function($q) use ($request){
                $q->where('message','like','%'.$request->search.'%');
            })
            ->latest()
            ->get()
            ->groupBy(fn($msg)=>$msg->date->format('F'));

        return view('detalhes-pedido',[
            'order'=>$order,
            'messages'=>$messages
        ]);
    }

    public function create()
    {

        $products = Product::where('active', true)->get();
        $clients = User::where('role','cliente')->get();

        return view('cadastrar-pedido', compact(
            'products',
            'clients'
        ));
    }


    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();

        $data['status'] = OrderStatusEnum::AGUARDANDO_PAGAMENTO;
        $data['criado_por'] = Auth::id();

        $order = Order::create($data);

        if ($order->product->isRecorrente()) {
            app(OrderDocumentCategoryService::class)
                ->createFromProduct($order);
        } else {
            app(OrderStepService::class)
                ->createStepsFromProduct($order);
        }

        /*
        |--------------------------------------------------------------------------
        | Salvar mensagem inicial
        |--------------------------------------------------------------------------
        */
        if ($request->filled('message')) {

            $order->messages()->create([

                'user_id' => Auth::id(),

                'message' => $request->message,

                'date' => now()

            ]);

        }

        /*
        |--------------------------------------------------------------------------
        | Salvar anexos (múltiplos)
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $this->storeFile($file, 'orders/' . $order->id);
                $order->attachments()->create(['file' => $path]);
            }
        }

        $recipients = app(NotificationService::class)
            ->recipientsPedidoCriado($order, Auth::id());

        Notification::send($recipients, new PedidoCriadoNotification($order));

        if ($request->ajax()) {
            return response()->json([
                'message'  => 'Pedido criado com sucesso!',
                'redirect' => route('detalhes-pedido', $order->id),
            ]);
        }

        return redirect()
            ->route('detalhes-pedido', $order->id);

    }


    public function update(UpdateOrderRequest $request,$id)
    {

        $order = Order::findOrFail($id);

        $order->update(
            $request->validated()
        );

        if ($request->ajax()) {
            return response()->json(['message' => 'Status atualizado com sucesso!']);
        }

        return back();
    }

    public function cancelar($id)
    {
        return $this->updateOrderStatus(
            $id,
            OrderStatusEnum::CANCELADO,
            fn($o) => !$o->isCancelado() && !$o->isConcluido(),
            'Pedido cancelado.'
        );
    }

    public function marcarPago($id)
    {
        return $this->updateOrderStatus(
            $id,
            OrderStatusEnum::PAGO,
            fn($o) => $o->isAguardandoPagamento(),
            'Pedido marcado como pago!'
        );
    }

    public function marcarRetorno($id)
    {
        return $this->updateOrderStatus(
            $id,
            OrderStatusEnum::RETORNO,
            fn($o) => $o->isEmAndamento(),
            'Pedido marcado para retorno.'
        );
    }

    public function storeMessage(Request $request, $id)
    {
        $request->validate([
            'mensagem' => 'required|string',
            'file'     => 'nullable|file|max:10000',
        ], [
            'mensagem.required' => 'Escreva uma mensagem antes de enviar.',
        ]);

        $order = Order::findOrFail($id);

        abort_if($order->isCancelado(), 403, 'Não é possível interagir com um pedido cancelado.');

        $data = [
            'user_id' => Auth::id(),
            'message' => $request->mensagem,
            'date' => now()
        ];

        if ($request->hasFile('file')) {
            $data['file'] = $this->storeFile($request->file('file'), "orders/messages/{$order->id}");
        }

        $order->messages()->create($data);

        $recipients = app(NotificationService::class)
            ->recipientsMensagem($order, Auth::id());

        Notification::send($recipients, new MensagemAdicionadaNotification($order, Auth::user()));

        if ($request->ajax()) {
            return response()->json(['message' => 'Mensagem enviada com sucesso!']);
        }

        return back();
    }

    public function aceitar($id)
    {
        $order = Order::findOrFail($id);

        if ($order->prestador || !$order->isPago()) {
            return back();
        }

        $order->update([
            'prestador' => Auth::id(),
            'status' => OrderStatusEnum::EM_ANDAMENTO,
        ]);

        if (!$order->product->isRecorrente()) {
            app(OrderStepService::class)
                ->startFirstStep($order);
        }

        $recipients = app(NotificationService::class)->recipientsPrestadorTrocado($order, Auth::id());
        Notification::send($recipients, new PrestadorVinculadoNotification($order));

        if (request()->ajax()) {
            return response()->json(['message' => 'Pedido aceito com sucesso!']);
        }

        return back();
    }

    public function trocarPrestador(Request $request, $id)
    {
        $order = Order::with('product')->findOrFail($id);

        $request->validate([
            'prestador_id' => 'nullable|exists:users,id',
        ]);

        $oldPrestador = $order->getRawOriginal('prestador');

        OrderPrestadorLog::create([
            'order_id'         => $order->id,
            'changed_by'       => Auth::id(),
            'old_prestador_id' => $oldPrestador,
            'new_prestador_id' => $request->prestador_id,
        ]);

        $order->update(['prestador' => $request->prestador_id]);

        if ($request->prestador_id) {
            $recipients = app(NotificationService::class)
                ->recipientsPrestadorTrocado($order, Auth::id());

            Notification::send($recipients, new PrestadorVinculadoNotification($order));
        }

        if ($request->ajax()) {
            return response()->json(['message' => 'Prestador atualizado com sucesso!']);
        }

        return back();
    }

    public function concluir($id)
    {
        $order = Order::with('product')->findOrFail($id);

        if (!$order->isEmAndamento() && !$order->isRetorno()) {
            return back();
        }

        $order->update(['status' => OrderStatusEnum::CONCLUIDO]);

        $recipients = app(NotificationService::class)->recipientsConclusao($order, Auth::id());
        Notification::send($recipients, new \App\Notifications\PedidoConcluidoNotification($order));

        if (request()->ajax()) {
            return response()->json(['message' => 'Pedido concluído com sucesso!']);
        }

        return back();
    }

    private function updateOrderStatus(int $id, OrderStatusEnum $newStatus, callable $canTransition, string $message)
    {
        $order = Order::with('product')->findOrFail($id);

        if (!$canTransition($order)) {
            return back();
        }

        $order->update(['status' => $newStatus]);

        $recipients = app(NotificationService::class)->recipientsMensagem($order, Auth::id());
        Notification::send($recipients, new StatusAtualizadoNotification($order));

        return $this->jsonOrBack($message);
    }

    private function jsonOrBack(string $message)
    {
        if (request()->ajax()) {
            return response()->json(['message' => $message]);
        }

        return back();
    }

    private function storeFile($file, string $directory): string
    {
        $name = time() . '_' . $file->getClientOriginalName();
        return $file->storeAs($directory, $name);
    }

    public function avancarEtapa($id)
    {
        $order = Order::findOrFail($id);

        if (!$order->isEmAndamento()) {
            return back();
        }

        app(OrderStepService::class)
            ->advance($order);

        $order->refresh();

        if ($order->currentStep) {
            $recipients = app(NotificationService::class)
                ->recipientsEtapaAvancada($order, Auth::id());

            Notification::send($recipients, new EtapaAvancadaNotification($order, $order->currentStep));
        }

        return back();
    }
}