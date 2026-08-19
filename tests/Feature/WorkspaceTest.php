<?php

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Support\Facades\DB;

test('creating a workspace does not lock an aggregate count', function () {
    $queries = [];

    DB::listen(function ($query) use (&$queries): void {
        $queries[] = $query->sql;
    });

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('workspaces.store'), ['name' => 'Minha Loja'])
        ->assertRedirect();

    $locksAnAggregate = collect($queries)->contains(function (string $sql): bool {
        $sql = mb_strtolower($sql);

        return str_contains($sql, 'count(') && str_contains($sql, 'for update');
    });

    expect($locksAnAggregate)->toBeFalse();
});

test('a user can create a workspace', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('workspaces.store'), ['name' => 'Minha Loja'])
        ->assertRedirect();

    $workspace = Workspace::query()->where('owner_id', $user->id)->first();

    expect($workspace)->not->toBeNull()
        ->and($workspace->name)->toBe('Minha Loja')
        ->and($user->isMemberOf($workspace))->toBeTrue()
        ->and($workspace->roleFor($user))->toBe(WorkspaceRole::Owner);
});

test('a free user can own three workspaces', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    foreach (['Loja 1', 'Loja 2', 'Loja 3'] as $name) {
        $this->post(route('workspaces.store'), ['name' => $name])->assertRedirect();
    }

    expect($user->ownedWorkspaceCount())->toBe(3);
});

test('a fourth owned workspace is blocked on the free plan', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    foreach (['Loja 1', 'Loja 2', 'Loja 3'] as $name) {
        $this->post(route('workspaces.store'), ['name' => $name]);
    }

    $this->post(route('workspaces.store'), ['name' => 'Loja 4'])
        ->assertSessionHasErrors('name');

    expect($user->ownedWorkspaceCount())->toBe(3);
});

test('membership in another workspace does not count toward the free limit', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    foreach (['Loja 1', 'Loja 2', 'Loja 3'] as $name) {
        $this->post(route('workspaces.store'), ['name' => $name]);
    }

    $external = Workspace::factory()->create();
    WorkspaceMember::factory()->create([
        'workspace_id' => $external->id,
        'user_id' => $user->id,
        'role' => WorkspaceRole::Member,
    ]);

    $this->post(route('workspaces.store'), ['name' => 'Loja 4'])
        ->assertSessionHasErrors('name');

    expect($user->fresh()->ownedWorkspaceCount())->toBe(3)
        ->and($user->isMemberOf($external))->toBeTrue();
});

test('a member can access a workspace they belong to', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);

    WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $member->id,
        'role' => WorkspaceRole::Member,
    ]);

    $this->actingAs($member)
        ->get(route('workspace.dashboard', $workspace))
        ->assertOk();
});

test('a user cannot access a workspace they do not belong to', function () {
    [$owner, $workspace] = userWithWorkspace();
    $stranger = User::factory()->create();

    $this->actingAs($stranger)
        ->get(route('workspace.dashboard', $workspace))
        ->assertForbidden();
});

test('the owner can update a workspace name', function () {
    [$user, $workspace] = userWithWorkspace();

    $this->actingAs($user)
        ->put(route('workspace.settings.update', $workspace), ['name' => 'Loja Nova'])
        ->assertRedirect();

    expect($workspace->fresh()->name)->toBe('Loja Nova');
});
