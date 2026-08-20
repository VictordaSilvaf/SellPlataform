<?php

namespace App\Models;

use App\Enums\SectionImageSide;
use App\Support\Images\ImageUrl;
use Database\Factories\MenuSectionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $menu_id
 * @property string $name
 * @property string|null $description
 * @property string|null $image_path
 * @property int $image_version
 * @property string $background_color
 * @property SectionImageSide $image_side
 * @property int $position
 * @property bool $active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Menu $menu
 */
#[Fillable([
    'menu_id',
    'name',
    'description',
    'image_path',
    'image_version',
    'background_color',
    'image_side',
    'position',
    'active',
])]
class MenuSection extends Model
{
    /** @use HasFactory<MenuSectionFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'active' => true,
        'image_version' => 0,
        'background_color' => '#1a1a1a',
        'image_side' => 'LEFT',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'active' => 'boolean',
            'image_version' => 'integer',
            'image_side' => SectionImageSide::class,
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
     * @return HasMany<MenuProduct, $this>
     */
    public function menuProducts(): HasMany
    {
        return $this->hasMany(MenuProduct::class)->orderBy('position');
    }

    public function imageUrl(): ?string
    {
        return ImageUrl::public($this->image_path, $this->image_version);
    }
}
