<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderMessageRequest;
use App\Http\Requests\UpdateOrderMessageRequest;
use App\Models\OrderMessage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class OrderMessageController extends Controller
{

    public function store(StoreOrderMessageRequest $request)
    {

        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('messages');
        }

        if ($request->hasFile('video')) {
            $data['video'] = $request->file('video')->store('messages');
        }

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file')->store('messages');
        }

        $data['user_id'] = Auth::id();
        $data['date'] = now();

        OrderMessage::create($data);

        return back();
    }

    public function download(OrderMessage $message)
    {
        if (!$message->file) {
            abort(404);
        }

        if (Storage::exists($message->file)) {
            return Storage::download($message->file);
        }

        if (Storage::disk('uploads')->exists($message->file)) {
            return Storage::disk('uploads')->download($message->file);
        }

        abort(404);
    }


    public function update(UpdateOrderMessageRequest $request,$id)
    {

        $message = OrderMessage::findOrFail($id);

        $message->update(
            $request->validated()
        );

        return back();
    }
}