<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\OrderAttachment;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderAttachmentModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_url_attribute_retorna_rota_correta(): void
    {
        $order      = Order::factory()->create();
        $attachment = OrderAttachment::create([
            'order_id' => $order->id,
            'file'     => 'orders/1/arquivo.pdf',
        ]);

        $expected = route('order-attachment.download', $attachment->id);

        $this->assertEquals($expected, $attachment->url);
    }

    public function test_get_nome_attribute_retorna_basename_do_arquivo(): void
    {
        $order      = Order::factory()->create();
        $attachment = OrderAttachment::create([
            'order_id' => $order->id,
            'file'     => 'orders/1/meu-arquivo.pdf',
        ]);

        $this->assertEquals('meu-arquivo.pdf', $attachment->nome);
    }

    public function test_relacao_order_retorna_instancia_de_order(): void
    {
        $order      = Order::factory()->create();
        $attachment = OrderAttachment::create([
            'order_id' => $order->id,
            'file'     => 'orders/1/arquivo.pdf',
        ]);

        $this->assertInstanceOf(Order::class, $attachment->order);
    }

    public function test_relacao_user_e_belongs_to(): void
    {
        $order      = Order::factory()->create();
        $attachment = OrderAttachment::create([
            'order_id' => $order->id,
            'file'     => 'orders/1/arquivo.pdf',
        ]);

        $this->assertInstanceOf(BelongsTo::class, $attachment->user());
    }

    public function test_attachment_sem_category_tem_document_category_null(): void
    {
        $order      = Order::factory()->create();
        $attachment = OrderAttachment::create([
            'order_id'                   => $order->id,
            'order_document_category_id' => null,
            'file'                       => 'orders/1/arquivo.pdf',
        ]);

        $this->assertNull($attachment->documentCategory);
    }
}
