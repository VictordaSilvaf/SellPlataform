<?php

namespace Database\Factories;

use App\Enums\MenuStatus;
use App\Models\Menu;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Menu>
 */
class MenuFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'workspace_id' => Workspace::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('###'),
            'description' => fake()->sentence(),
            'status' => MenuStatus::Active,
            'banner_color' => '#141414',
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => MenuStatus::Draft]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['status' => MenuStatus::Inactive]);
    }
}
