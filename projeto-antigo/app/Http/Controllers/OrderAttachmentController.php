<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderAttachmentRequest;
use App\Models\Order;
use App\Models\OrderAttachment;
use App\Notifications\AnexoAdicionadoNotification;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class OrderAttachmentController extends Controller
{
    public function store(StoreOrderAttachmentRequest $request)
    {
        $order = Order::with('product')->findOrFail($request->order_id);

        abort_if($order->isCancelado(), 403, 'Não é possível interagir com um pedido cancelado.');

        foreach ($request->file('files') as $file) {
            $name = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('orders/' . $order->id, $name);

            OrderAttachment::create([
                'order_id'                     => $order->id,
                'order_document_category_id'   => $request->order_document_category_id ?? null,
                'file'                         => $path,
            ]);
        }

        $recipients = app(NotificationService::class)->recipientsMensagem($order, Auth::id());
        Notification::send($recipients, new AnexoAdicionadoNotification($order));

        if ($request->ajax()) {
            return response()->json(['message' => 'Arquivos enviados com sucesso!']);
        }

        return back();
    }

    public function download(OrderAttachment $attachment)
    {
        abort_unless($attachment->order->canBeViewedBy(auth()->user()), 403);

        if (Storage::exists($attachment->file)) {
            return Storage::download($attachment->file);
        }

        if (Storage::disk('uploads')->exists($attachment->file)) {
            return Storage::disk('uploads')->download($attachment->file);
        }

        abort(404);
    }
}
