<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\MenuProduct;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuProduct>
 */
class MenuProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'menu_id' => Menu::factory(),
            'product_id' => Product::factory(),
            'position' => fake()->numberBetween(1, 20),
            'active' => true,
            'unavailable_reason' => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['active' => false]);
    }
}
