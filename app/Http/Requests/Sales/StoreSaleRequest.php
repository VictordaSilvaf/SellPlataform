<?php

namespace App\Http\Requests\Sales;

use App\Enums\SaleStatus;
use App\Models\Sale;
use App\Models\Workspace;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $workspace = $this->route('workspace');

        return $workspace instanceof Workspace
            && $this->user()?->can('create', [Sale::class, $workspace]) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'status' => ['required', Rule::enum(SaleStatus::class)->only([SaleStatus::Paid, SaleStatus::Pending])],
        ];
    }

    /**
     * @return array{items: list<array{product_id: int, quantity: int}>, status: string}
     */
    public function saleData(): array
    {
        $items = [];

        foreach ($this->array('items') as $item) {
            if (! is_array($item)) {
                continue;
            }

            $items[] = [
                'product_id' => (int) ($item['product_id'] ?? 0),
                'quantity' => (int) ($item['quantity'] ?? 0),
            ];
        }

        return [
            'items' => $items,
            'status' => $this->string('status')->toString(),
        ];
    }
}
