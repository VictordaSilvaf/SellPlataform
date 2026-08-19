<?php

namespace App\Http\Requests\Menus;

use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;

class AddMenuProductsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $menu = $this->route('menu');

        return $menu instanceof Menu
            && $this->user()?->can('addProducts', $menu) === true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'product_ids' => ['required', 'array', 'min:1'],
            'product_ids.*' => ['integer'],
        ];
    }

    /**
     * @return list<int>
     */
    public function productIds(): array
    {
        /** @var list<int> $ids */
        $ids = array_values(array_map('intval', $this->validated('product_ids')));

        return $ids;
    }
}
