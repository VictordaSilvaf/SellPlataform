<?php

namespace App\Models;

use App\Enums\MenuStatus;
use Database\Factories\MenuProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $menu_id
 * @property int $product_id
 * @property int $position
 * @property bool $active
 * @property string|null $unavailable_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Menu $menu
 * @property-read Product $product
 */
#[Fillable(['menu_id', 'product_id', 'position', 'active', 'unavailable_reason'])]
class MenuProduct extends Model
{
    /** @use HasFactory<MenuProductFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'active' => true,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Menu, $this>
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function isPubliclyAvailable(): bool
    {
        $this->loadMissing(['menu', 'product']);

        return $this->menu->status === MenuStatus::Active
            && $this->product->active
            && $this->active;
    }
}
