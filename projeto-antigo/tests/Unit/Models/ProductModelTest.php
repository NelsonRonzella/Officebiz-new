<?php

namespace Tests\Unit\Models;

use App\Models\Product;
use App\Models\ProductDocumentCategory;
use App\Models\ProductStep;
use App\Models\Order;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_pontual_retorna_true_para_tipo_pontual(): void
    {
        $product = Product::factory()->create(['type' => 'pontual']);

        $this->assertFalse($product->isRecorrente());
    }

    public function test_is_recorrente_retorna_true_para_tipo_recorrente(): void
    {
        $product = Product::factory()->create(['type' => 'recorrente']);

        $this->assertTrue($product->isRecorrente());
    }

    public function test_relacao_steps_retorna_has_many(): void
    {
        $product = Product::factory()->create();

        $this->assertInstanceOf(HasMany::class, $product->steps());
    }

    public function test_relacao_document_categories_retorna_has_many(): void
    {
        $product = Product::factory()->create();

        $this->assertInstanceOf(HasMany::class, $product->documentCategories());
    }

    public function test_relacao_orders_retorna_has_many(): void
    {
        $product = Product::factory()->create();

        $this->assertInstanceOf(HasMany::class, $product->orders());
    }

    public function test_active_cast_boolean_produto_inativo(): void
    {
        $product = Product::factory()->create(['active' => false]);

        $this->assertFalse($product->active);
        $this->assertIsBool($product->active);
    }
}
