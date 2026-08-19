<?php

namespace App\Http\Requests\Menus;

use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;

class ReorderMenuProductsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $menu = $this->route('menu');

        return $menu instanceof Menu
            && $this->user()?->can('reorder', $menu) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.menu_section_id' => ['nullable', 'integer'],
            'items.*.position' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * @return list<array{product_id: int, menu_section_id: int|null, position: int}>
     */
    public function items(): array
    {
        /** @var list<array{product_id: int|string, menu_section_id: int|string|null, position: int|string}> $items */
        $items = $this->validated('items');

        return array_map(fn (array $item): array => [
            'product_id' => (int) $item['product_id'],
            'menu_section_id' => $item['menu_section_id'] !== null ? (int) $item['menu_section_id'] : null,
            'position' => (int) $item['position'],
        ], $items);
    }
}
