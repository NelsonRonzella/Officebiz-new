<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PushSubscriptionController extends Controller
{
    public function subscribe(Request $request): Response
    {
        $request->validate([
            'endpoint'          => 'required|url',
            'keys.p256dh'       => 'required|string',
            'keys.auth'         => 'required|string',
        ]);

        $request->user()->updatePushSubscription(
            $request->endpoint,
            $request->keys['p256dh'],
            $request->keys['auth'],
            $request->input('contentEncoding', 'aesgcm'),
        );

        return response()->noContent();
    }

    public function unsubscribe(Request $request): Response
    {
        $request->validate(['endpoint' => 'required|url']);

        $request->user()->deletePushSubscription($request->endpoint);

        return response()->noContent();
    }
}
