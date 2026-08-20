<?php

namespace App\Models;

use App\Enums\MenuStatus;
use App\Support\Images\ImageUrl;
use Database\Factories\MenuFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $workspace_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property MenuStatus $status
 * @property string|null $banner_path
 * @property int $banner_version
 * @property string $banner_color
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Workspace $workspace
 */
#[Fillable([
    'workspace_id',
    'name',
    'slug',
    'description',
    'status',
    'banner_path',
    'banner_version',
    'banner_color',
])]
class Menu extends Model
{
    /** @use HasFactory<MenuFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'DRAFT',
        'banner_version' => 0,
        'banner_color' => '#141414',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => MenuStatus::class,
            'banner_version' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Workspace, $this>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * @return HasMany<MenuProduct, $this>
     */
    public function menuProducts(): HasMany
    {
        return $this->hasMany(MenuProduct::class)->orderBy('position');
    }

    /**
     * @return HasMany<MenuSection, $this>
     */
    public function sections(): HasMany
    {
        return $this->hasMany(MenuSection::class)->orderBy('position');
    }

    /**
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'menu_products')
            ->withPivot(['position', 'active', 'unavailable_reason', 'menu_section_id'])
            ->withTimestamps()
            ->orderByPivot('position');
    }

    public function bannerUrl(): ?string
    {
        return ImageUrl::public($this->banner_path, $this->banner_version);
    }

    public static function uniqueSlug(string $name): string
    {
        $slug = Str::slug($name) ?: 'cardapio';
        $base = $slug;
        $suffix = 1;

        while (static::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
