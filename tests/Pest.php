<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

function userWithWorkspace(array $userAttributes = [], string $workspaceName = 'Minha Loja'): array
{
    $user = User::factory()->create($userAttributes);
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'name' => $workspaceName,
    ]);

    return [$user, $workspace];
}
