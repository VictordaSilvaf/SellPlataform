<?php

namespace App\Http\Requests\Menus;

use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;

class ReorderMenuSectionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $menu = $this->route('menu');

        return $menu instanceof Menu
            && $this->user()?->can('reorder', $menu) === true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'section_ids' => ['required', 'array', 'min:1'],
            'section_ids.*' => ['integer'],
        ];
    }

    /**
     * @return list<int>
     */
    public function sectionIds(): array
    {
        /** @var list<int> $ids */
        $ids = array_values(array_map('intval', $this->validated('section_ids')));

        return $ids;
    }
}
