<?php

namespace App\Http\Requests\Menus;

use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;

class ToggleMenuProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $menu = $this->route('menu');

        return $menu instanceof Menu
            && $this->user()?->can('update', $menu) === true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'active' => ['required', 'boolean'],
        ];
    }
}
