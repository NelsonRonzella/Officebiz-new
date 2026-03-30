<?php

namespace Tests\Unit\Services;

use App\Models\Order;
use App\Models\Product;
use App\Services\OrderDocumentCategoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderDocumentCategoryServiceTest extends TestCase
{
    use RefreshDatabase;

    private OrderDocumentCategoryService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(OrderDocumentCategoryService::class);
    }

    public function test_cria_categorias_a_partir_do_produto(): void
    {
        $product = Product::factory()->recorrente()->create();
        $product->documentCategories()->createMany([
            ['title' => 'Categoria A', 'description' => 'Desc A', 'order' => 1],
            ['title' => 'Categoria B', 'description' => 'Desc B', 'order' => 2],
        ]);

        $order = Order::factory()->create(['product_id' => $product->id]);

        $this->service->createFromProduct($order);

        $this->assertCount(2, $order->fresh()->documentCategories);
    }

    public function test_cria_categorias_com_dados_corretos(): void
    {
        $product = Product::factory()->recorrente()->create();
        $category = $product->documentCategories()->create([
            'title'       => 'Balancete Mensal',
            'description' => 'Enviar balancete do mês',
            'order'       => 1,
        ]);

        $order = Order::factory()->create(['product_id' => $product->id]);

        $this->service->createFromProduct($order);

        $this->assertDatabaseHas('order_document_categories', [
            'order_id'                     => $order->id,
            'product_document_category_id' => $category->id,
            'title'                        => 'Balancete Mensal',
            'description'                  => 'Enviar balancete do mês',
            'order'                        => 1,
        ]);
    }

    public function test_produto_sem_categorias_nao_cria_nada(): void
    {
        $product = Product::factory()->recorrente()->create();
        $order   = Order::factory()->create(['product_id' => $product->id]);

        $this->service->createFromProduct($order);

        $this->assertCount(0, $order->fresh()->documentCategories);
    }

    public function test_categorias_criadas_na_ordem_correta(): void
    {
        $product = Product::factory()->recorrente()->create();
        $product->documentCategories()->createMany([
            ['title' => 'Terceira', 'description' => '', 'order' => 3],
            ['title' => 'Primeira', 'description' => '', 'order' => 1],
            ['title' => 'Segunda',  'description' => '', 'order' => 2],
        ]);

        $order = Order::factory()->create(['product_id' => $product->id]);

        $this->service->createFromProduct($order);

        $categories = $order->fresh()->documentCategories()->orderBy('order')->pluck('title')->toArray();
        $this->assertEquals(['Primeira', 'Segunda', 'Terceira'], $categories);
    }
}
