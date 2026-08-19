<?php

use App\Enums\MenuStatus;
use App\Enums\WorkspaceRole;
use App\Models\Menu;
use App\Models\MenuProduct;
use App\Models\MenuSection;
use App\Models\Product;
use App\Models\User;
use App\Models\WorkspaceMember;

test('a section can be created updated toggled and deleted without removing products', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post(route('workspace.menus.sections.store', [$workspace, $menu]), [
            'name' => 'Hambúrgueres',
            'description' => 'Nossos clássicos',
        ])
        ->assertRedirect();

    $section = $menu->sections()->first();

    expect($section)->not->toBeNull()
        ->and($section->name)->toBe('Hambúrgueres')
        ->and($section->position)->toBe(1);

    $this->post(route('workspace.menus.products.store', [$workspace, $menu]), [
        'product_ids' => [$product->id],
        'menu_section_id' => $section->id,
    ])->assertRedirect();

    expect($menu->menuProducts()->first()->menu_section_id)->toBe($section->id);

    $this->put(route('workspace.menus.sections.update', [$workspace, $menu, $section]), [
        'name' => 'Burgers',
        'description' => 'Atualizado',
    ])->assertRedirect();

    $this->patch(route('workspace.menus.sections.toggle', [$workspace, $menu, $section]), [
        'active' => false,
    ])->assertRedirect();

    expect($section->fresh()->name)->toBe('Burgers')
        ->and($section->fresh()->active)->toBeFalse();

    $this->delete(route('workspace.menus.sections.destroy', [$workspace, $menu, $section]))
        ->assertRedirect();

    expect(MenuSection::query()->whereKey($section->id)->exists())->toBeFalse()
        ->and($menu->menuProducts()->first()->menu_section_id)->toBeNull()
        ->and($menu->menuProducts()->count())->toBe(1);
});

test('sections can be reordered', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $first = MenuSection::factory()->create(['menu_id' => $menu->id, 'position' => 1, 'name' => 'A']);
    $second = MenuSection::factory()->create(['menu_id' => $menu->id, 'position' => 2, 'name' => 'B']);

    $this->actingAs($user)
        ->patch(route('workspace.menus.sections.order', [$workspace, $menu]), [
            'section_ids' => [$second->id, $first->id],
        ])
        ->assertRedirect();

    expect($menu->sections()->orderBy('position')->pluck('id')->all())
        ->toBe([$second->id, $first->id]);
});

test('empty and inactive sections are hidden on the public menu', function () {
    $menu = Menu::factory()->create(['status' => MenuStatus::Active]);
    $empty = MenuSection::factory()->create(['menu_id' => $menu->id, 'name' => 'Vazia', 'position' => 1]);
    $inactive = MenuSection::factory()->inactive()->create(['menu_id' => $menu->id, 'name' => 'Inativa', 'position' => 2]);
    $visible = MenuSection::factory()->create(['menu_id' => $menu->id, 'name' => 'Hambúrgueres', 'position' => 3]);
    $product = Product::factory()->create(['workspace_id' => $menu->workspace_id, 'name' => 'X-Bacon']);
    $other = Product::factory()->create(['workspace_id' => $menu->workspace_id, 'name' => 'Combo']);
    $loose = Product::factory()->create(['workspace_id' => $menu->workspace_id, 'name' => 'Água']);

    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'menu_section_id' => $inactive->id,
        'product_id' => $other->id,
        'position' => 1,
        'active' => true,
    ]);
    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'menu_section_id' => $visible->id,
        'product_id' => $product->id,
        'position' => 1,
        'active' => true,
    ]);
    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'menu_section_id' => null,
        'product_id' => $loose->id,
        'position' => 1,
        'active' => true,
    ]);

    expect($empty)->not->toBeNull();

    $this->get(route('menus.public', $menu))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/menu')
            ->has('unsectioned', 1)
            ->where('unsectioned.0.name', 'Água')
            ->has('sections', 1)
            ->where('sections.0.name', 'Hambúrgueres')
            ->where('sections.0.products.0.name', 'X-Bacon')
            ->missing('workspace.id'));
});

test('a member cannot manage sections', function () {
    [$owner, $workspace] = userWithWorkspace();
    $member = User::factory()->create();
    WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $member->id,
        'role' => WorkspaceRole::Member,
    ]);
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($member)
        ->post(route('workspace.menus.sections.store', [$workspace, $menu]), [
            'name' => 'Bebidas',
        ])
        ->assertForbidden();
});

test('a section from another menu cannot be updated', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $other = Menu::factory()->create();
    $section = MenuSection::factory()->create(['menu_id' => $other->id]);

    $this->actingAs($user)
        ->put(route('workspace.menus.sections.update', [$workspace, $menu, $section]), [
            'name' => 'Hack',
        ])
        ->assertNotFound();
});

test('products can move between a section and the unsectioned list', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $section = MenuSection::factory()->create(['menu_id' => $menu->id, 'position' => 1]);
    $first = Product::factory()->create(['workspace_id' => $workspace->id]);
    $second = Product::factory()->create(['workspace_id' => $workspace->id]);

    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'menu_section_id' => $section->id,
        'product_id' => $first->id,
        'position' => 1,
    ]);
    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'menu_section_id' => null,
        'product_id' => $second->id,
        'position' => 1,
    ]);

    $this->actingAs($user)
        ->patch(route('workspace.menus.products.order', [$workspace, $menu]), [
            'items' => [
                ['product_id' => $first->id, 'menu_section_id' => null, 'position' => 1],
                ['product_id' => $second->id, 'menu_section_id' => $section->id, 'position' => 1],
            ],
        ])
        ->assertRedirect();

    expect($menu->menuProducts()->where('product_id', $first->id)->value('menu_section_id'))->toBeNull()
        ->and($menu->menuProducts()->where('product_id', $second->id)->value('menu_section_id'))->toBe($section->id);
});
