<?php

namespace App\Actions\Menus;

use App\Enums\MenuStatus;
use App\Models\Menu;
use App\Models\Workspace;
use App\Support\MenuLimitChecker;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class CreateMenuAction
{
    public function __construct(private MenuLimitChecker $menuLimitChecker) {}

    /**
     * @param  array{name: string, description?: string|null}  $data
     */
    public function handle(Workspace $workspace, array $data): Menu
    {
        return DB::transaction(function () use ($workspace, $data): Menu {
            $workspace = Workspace::query()->whereKey($workspace->id)->lockForUpdate()->firstOrFail();

            $this->menuLimitChecker->assertCanCreate($workspace);

            $attempt = 0;

            while (true) {
                try {
                    return $workspace->menus()->create([
                        'name' => $data['name'],
                        'description' => $data['description'] ?? null,
                        'slug' => Menu::uniqueSlug($data['name']),
                        'status' => MenuStatus::Draft,
                    ]);
                } catch (UniqueConstraintViolationException $exception) {
                    $attempt++;

                    if ($attempt >= 5) {
                        throw $exception;
                    }
                }
            }
        });
    }
}
