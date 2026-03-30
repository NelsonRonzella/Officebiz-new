<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderDocumentCategory;

class OrderDocumentCategoryService
{
    public function createFromProduct(Order $order): void
    {
        $categories = $order->product
            ->documentCategories()
            ->orderBy('order')
            ->get();

        foreach ($categories as $category) {
            OrderDocumentCategory::create([
                'order_id'                       => $order->id,
                'product_document_category_id'   => $category->id,
                'title'                          => $category->title,
                'description'                    => $category->description,
                'order'                          => $category->order,
            ]);
        }
    }
}
