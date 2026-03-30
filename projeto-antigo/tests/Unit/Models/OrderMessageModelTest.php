<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\OrderMessage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderMessageModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_file_url_attribute_retorna_null_quando_file_e_null(): void
    {
        $order = Order::factory()->create();
        $user  = User::factory()->create();

        $msg = OrderMessage::create([
            'order_id' => $order->id,
            'user_id'  => $user->id,
            'message'  => 'sem arquivo',
            'date'     => now(),
            'file'     => null,
        ]);

        $this->assertNull($msg->file_url);
    }

    public function test_get_file_url_attribute_retorna_rota_quando_file_preenchido(): void
    {
        $order = Order::factory()->create();
        $user  = User::factory()->create();

        $msg = OrderMessage::create([
            'order_id' => $order->id,
            'user_id'  => $user->id,
            'message'  => 'com arquivo',
            'date'     => now(),
            'file'     => 'orders/1/mensagem.pdf',
        ]);

        $expected = route('order-message.download', $msg->id);

        $this->assertEquals($expected, $msg->file_url);
    }

    public function test_get_file_name_attribute_retorna_null_quando_file_e_null(): void
    {
        $order = Order::factory()->create();
        $user  = User::factory()->create();

        $msg = OrderMessage::create([
            'order_id' => $order->id,
            'user_id'  => $user->id,
            'message'  => 'sem arquivo',
            'date'     => now(),
            'file'     => null,
        ]);

        $this->assertNull($msg->file_name);
    }

    public function test_get_file_name_attribute_retorna_basename_quando_file_preenchido(): void
    {
        $order = Order::factory()->create();
        $user  = User::factory()->create();

        $msg = OrderMessage::create([
            'order_id' => $order->id,
            'user_id'  => $user->id,
            'message'  => 'com arquivo',
            'date'     => now(),
            'file'     => 'orders/1/documento-final.pdf',
        ]);

        $this->assertEquals('documento-final.pdf', $msg->file_name);
    }

    public function test_date_e_castado_como_carbon(): void
    {
        $order = Order::factory()->create();
        $user  = User::factory()->create();

        $msg = OrderMessage::create([
            'order_id' => $order->id,
            'user_id'  => $user->id,
            'message'  => 'teste',
            'date'     => now(),
            'file'     => null,
        ]);

        $this->assertInstanceOf(Carbon::class, $msg->fresh()->date);
    }
}
