<?php

namespace App\Actions\Sales;

use App\Enums\SaleStatus;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateSaleAction
{
    /**
     * @param  array{items: list<array{product_id: int, quantity: int}>, status: string}  $data
     */
    public function handle(Workspace $workspace, array $data): Sale
    {
        return DB::transaction(function () use ($workspace, $data): Sale {
            $status = SaleStatus::from($data['status']);
            $productIds = collect($data['items'])->pluck('product_id')->unique()->all();

            $products = Product::query()
                ->where('workspace_id', $workspace->id)
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $items = [];
            $total = 0;

            foreach ($data['items'] as $index => $item) {
                $product = $products->get($item['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages([
                        "items.{$index}.product_id" => 'O produto não pertence a este ambiente ou não existe.',
                    ]);
                }

                if (! $product->active) {
                    throw ValidationException::withMessages([
                        "items.{$index}.product_id" => 'Produtos desativados não podem ser adicionados a novas vendas.',
                    ]);
                }

                $quantity = (int) $item['quantity'];

                if ($quantity < 1) {
                    throw ValidationException::withMessages([
                        "items.{$index}.quantity" => 'A quantidade deve ser maior que zero.',
                    ]);
                }

                $lineTotal = $product->price * $quantity;
                $total += $lineTotal;

                $items[] = [
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $product->price,
                    'total' => $lineTotal,
                ];
            }

            $sale = $workspace->sales()->create([
                'status' => $status,
                'total' => $total,
                'sold_at' => now(),
            ]);

            $sale->items()->createMany($items);

            return $sale->load('items.product');
        });
    }
}
