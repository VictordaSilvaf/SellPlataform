<?php

namespace App\Http\Requests\Products;

use App\Models\Product;
use App\Models\Workspace;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $workspace = $this->route('workspace');

        return $workspace instanceof Workspace
            && $this->user()?->can('create', [Product::class, $workspace]) === true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'integer', 'min:1'],
            'active' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'file', 'max:10240', 'mimes:jpeg,jpg,png,webp'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'price.min' => 'O preço deve ser maior que zero.',
            'image.max' => 'O arquivo é muito grande. O limite é de 10 MB.',
            'image.mimes' => 'Formato não suportado. Envie JPEG, PNG ou WebP.',
        ];
    }

    public function uploadedImage(): ?UploadedFile
    {
        $file = $this->file('image');

        return $file instanceof UploadedFile ? $file : null;
    }

    /**
     * @return array{name: string, description: string|null, price: int, active: bool}
     */
    public function productData(): array
    {
        return [
            'name' => $this->string('name')->toString(),
            'description' => $this->filled('description') ? $this->string('description')->toString() : null,
            'price' => $this->integer('price'),
            'active' => $this->has('active') ? $this->boolean('active') : true,
        ];
    }
}
