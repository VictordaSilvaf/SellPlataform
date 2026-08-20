<?php

namespace App\Http\Requests\Menus;

use App\Enums\MenuStatus;
use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        $menu = $this->route('menu');

        return $menu instanceof Menu
            && $this->user()?->can('update', $menu) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::enum(MenuStatus::class)],
            'banner_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }

    /**
     * @return array{name: string, description: string|null, status: MenuStatus, banner_color: string}
     */
    public function menuData(): array
    {
        return [
            'name' => $this->string('name')->toString(),
            'description' => $this->filled('description') ? $this->string('description')->toString() : null,
            'status' => MenuStatus::from($this->string('status')->toString()),
            'banner_color' => mb_strtoupper($this->string('banner_color')->toString()),
        ];
    }
}
