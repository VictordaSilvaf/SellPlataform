<?php

namespace App\Http\Requests\Menus;

use App\Enums\SectionImageSide;
use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuSectionRequest extends FormRequest
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
            'background_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'image_side' => ['required', Rule::enum(SectionImageSide::class)],
        ];
    }

    /**
     * @return array{name: string, description: string|null, background_color: string, image_side: SectionImageSide}
     */
    public function sectionData(): array
    {
        return [
            'name' => $this->string('name')->toString(),
            'description' => $this->filled('description') ? $this->string('description')->toString() : null,
            'background_color' => mb_strtoupper($this->string('background_color')->toString()),
            'image_side' => SectionImageSide::from($this->string('image_side')->toString()),
        ];
    }
}
