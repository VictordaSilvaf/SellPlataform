<?php

namespace Database\Factories;

use App\Enums\SaleStatus;
use App\Models\Sale;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'status' => SaleStatus::Paid,
            'total' => 0,
            'sold_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => ['status' => SaleStatus::Pending]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => ['status' => SaleStatus::Cancelled]);
    }
}
