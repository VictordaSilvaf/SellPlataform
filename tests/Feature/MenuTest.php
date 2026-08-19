<?php

use App\Enums\MenuStatus;
use App\Enums\WorkspaceRole;
use App\Models\Menu;
use App\Models\MenuProduct;
use App\Models\Plan;
use App\Models\Product;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;

test('a free workspace can create one menu', function () {
    [$user, $workspace] = userWithWorkspace();

    $this->actingAs($user)
        ->post(route('workspace.menus.store', $workspace), [
            'name' => 'Cardápio Principal',
            'description' => 'Confira nossos produtos',
        ])
        ->assertRedirect();

    $menu = Menu::query()->where('workspace_id', $workspace->id)->first();

    expect($menu)->not->toBeNull()
        ->and($menu->name)->toBe('Cardápio Principal')
        ->and($menu->slug)->toBe('cardapio-principal')
        ->and($menu->status)->toBe(MenuStatus::Draft);
});

test('a second menu is blocked when the plan limit is reached', function () {
    [$user, $workspace] = userWithWorkspace();
    Menu::factory()->create(['workspace_id' => $workspace->id]);
    $plan = $user->fresh()->plan;

    $this->actingAs($user)
        ->post(route('workspace.menus.store', $workspace), [
            'name' => 'Cardápio Extra',
        ])
        ->assertSessionHasErrors('name');

    expect(session('errors')->first('name'))
        ->toContain((string) $plan->max_menus)
        ->toContain($plan->name)
        ->and(Menu::query()->where('workspace_id', $workspace->id)->count())->toBe(1);
});

test('a plan with a higher menu limit allows that many menus', function () {
    [$user, $workspace] = userWithWorkspace();
    $plan = Plan::factory()->create([
        'name' => 'Pro',
        'max_workspaces' => 10,
        'max_members' => 10,
        'max_menus' => 5,
    ]);
    $user->update(['plan_id' => $plan->id]);

    $this->actingAs($user);

    foreach (range(1, 5) as $index) {
        $this->post(route('workspace.menus.store', $workspace), [
            'name' => 'Cardápio '.$index,
        ])->assertRedirect();
    }

    $this->post(route('workspace.menus.store', $workspace), [
        'name' => 'Cardápio 6',
    ])->assertSessionHasErrors('name');

    expect(session('errors')->first('name'))
        ->toContain((string) $plan->max_menus)
        ->toContain($plan->name)
        ->and(Menu::query()->where('workspace_id', $workspace->id)->count())->toBe(5);
});

test('an unlimited plan can create several menus', function () {
    [$user, $workspace] = userWithWorkspace();
    $plan = Plan::factory()->create([
        'name' => 'Business',
        'max_workspaces' => 10,
        'max_members' => 10,
        'max_menus' => null,
    ]);
    $user->update(['plan_id' => $plan->id]);

    $this->actingAs($user);

    foreach (range(1, 3) as $index) {
        $this->post(route('workspace.menus.store', $workspace), [
            'name' => 'Cardápio '.$index,
        ])->assertRedirect();
    }

    expect(Menu::query()->where('workspace_id', $workspace->id)->count())->toBe(3);
});

test('duplicate slugs receive a numeric suffix even across workspaces', function () {
    [$user, $workspace] = userWithWorkspace();
    $plan = Plan::factory()->create([
        'name' => 'Pro',
        'max_workspaces' => 10,
        'max_members' => 10,
        'max_menus' => 5,
    ]);
    $user->update(['plan_id' => $plan->id]);

    $this->actingAs($user)
        ->post(route('workspace.menus.store', $workspace), ['name' => 'Cardápio Principal'])
        ->assertRedirect();

    $this->post(route('workspace.menus.store', $workspace), ['name' => 'Cardápio Principal'])
        ->assertRedirect();

    expect(Menu::query()->where('workspace_id', $workspace->id)->orderBy('id')->pluck('slug')->all())
        ->toBe(['cardapio-principal', 'cardapio-principal-1']);
});

test('renaming a menu does not change its slug', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create([
        'workspace_id' => $workspace->id,
        'slug' => 'cardapio-principal',
    ]);

    $this->actingAs($user)
        ->put(route('workspace.menus.update', [$workspace, $menu]), [
            'name' => 'Cardápio da Lanchonete',
            'status' => MenuStatus::Active->value,
        ])
        ->assertRedirect();

    expect($menu->fresh()->name)->toBe('Cardápio da Lanchonete')
        ->and($menu->fresh()->slug)->toBe('cardapio-principal');
});

test('products can be added to a menu and duplicates are ignored', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $first = Product::factory()->create(['workspace_id' => $workspace->id]);
    $second = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post(route('workspace.menus.products.store', [$workspace, $menu]), [
            'product_ids' => [$first->id, $second->id, $first->id],
        ])
        ->assertRedirect();

    expect($menu->menuProducts()->count())->toBe(2)
        ->and($menu->menuProducts()->orderBy('position')->pluck('product_id')->all())
        ->toBe([$first->id, $second->id]);
});

test('a product from another workspace is not added to the menu', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $foreign = Product::factory()->create();

    $this->actingAs($user)
        ->post(route('workspace.menus.products.store', [$workspace, $menu]), [
            'product_ids' => [$foreign->id],
        ])
        ->assertRedirect();

    expect($menu->menuProducts()->count())->toBe(0);
});

test('a product can be removed from a menu', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);
    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'product_id' => $product->id,
        'position' => 1,
    ]);

    $this->actingAs($user)
        ->delete(route('workspace.menus.products.destroy', [$workspace, $menu, $product]))
        ->assertRedirect();

    expect($menu->menuProducts()->count())->toBe(0);
});

test('deactivating a menu product keeps its position', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $first = Product::factory()->create(['workspace_id' => $workspace->id]);
    $second = Product::factory()->create(['workspace_id' => $workspace->id]);

    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'product_id' => $first->id,
        'position' => 1,
    ]);
    $pivot = MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'product_id' => $second->id,
        'position' => 2,
    ]);

    $this->actingAs($user)
        ->patch(route('workspace.menus.products.toggle', [$workspace, $menu, $second]), [
            'active' => false,
        ])
        ->assertRedirect();

    expect($pivot->fresh()->active)->toBeFalse()
        ->and($pivot->fresh()->position)->toBe(2);

    $this->patch(route('workspace.menus.products.toggle', [$workspace, $menu, $second]), [
        'active' => true,
    ])->assertRedirect();

    expect($pivot->fresh()->active)->toBeTrue()
        ->and($pivot->fresh()->position)->toBe(2);
});

test('menu products can be reordered', function () {
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $first = Product::factory()->create(['workspace_id' => $workspace->id]);
    $second = Product::factory()->create(['workspace_id' => $workspace->id]);
    $third = Product::factory()->create(['workspace_id' => $workspace->id]);

    MenuProduct::factory()->create(['menu_id' => $menu->id, 'product_id' => $first->id, 'position' => 1]);
    MenuProduct::factory()->create(['menu_id' => $menu->id, 'product_id' => $second->id, 'position' => 2]);
    MenuProduct::factory()->create(['menu_id' => $menu->id, 'product_id' => $third->id, 'position' => 3]);

    $this->actingAs($user)
        ->patch(route('workspace.menus.products.order', [$workspace, $menu]), [
            'product_ids' => [$third->id, $first->id, $second->id],
        ])
        ->assertRedirect();

    expect($menu->menuProducts()->orderBy('position')->pluck('product_id')->all())
        ->toBe([$third->id, $first->id, $second->id]);
});

test('a member cannot create a menu or toggle availability', function () {
    [$owner, $workspace] = userWithWorkspace();
    $member = User::factory()->create();
    WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $member->id,
        'role' => WorkspaceRole::Member,
    ]);
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);
    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'product_id' => $product->id,
        'position' => 1,
        'active' => true,
    ]);

    $this->actingAs($member)
        ->post(route('workspace.menus.store', $workspace), [
            'name' => 'Outro cardápio',
        ])
        ->assertForbidden();

    $this->actingAs($member)
        ->get(route('workspace.menus.index', $workspace))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('canCreate', false)
            ->where('canManage', false));

    $this->actingAs($member)
        ->patch(route('workspace.menus.products.toggle', [$workspace, $menu, $product]), [
            'active' => false,
        ])
        ->assertForbidden();
});

test('a user cannot access a menu from another workspace', function () {
    [$user, $workspace] = userWithWorkspace();
    $other = Workspace::factory()->create();
    $menu = Menu::factory()->create(['workspace_id' => $other->id]);

    $this->actingAs($user)
        ->get(route('workspace.menus.show', [$workspace, $menu]))
        ->assertNotFound();
});

test('a stranger cannot modify a menu', function () {
    [$owner, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $stranger = User::factory()->create();

    $this->actingAs($stranger)
        ->put(route('workspace.menus.update', [$workspace, $menu]), [
            'name' => 'Hack',
            'status' => MenuStatus::Active->value,
        ])
        ->assertForbidden();
});

test('a product is not publicly available when the menu product or catalog item is inactive', function () {
    $menu = Menu::factory()->create(['status' => MenuStatus::Active]);
    $product = Product::factory()->create(['workspace_id' => $menu->workspace_id, 'active' => true]);
    $item = MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'product_id' => $product->id,
        'active' => true,
    ]);

    expect($item->isPubliclyAvailable())->toBeTrue();

    $item->update(['active' => false]);
    expect($item->fresh()->isPubliclyAvailable())->toBeFalse();

    $item->update(['active' => true]);
    $product->update(['active' => false]);
    expect($item->fresh()->isPubliclyAvailable())->toBeFalse();

    $product->update(['active' => true]);
    $menu->update(['status' => MenuStatus::Inactive]);
    expect($item->fresh()->isPubliclyAvailable())->toBeFalse();
});

test('slug uniqueness is global across workspaces', function () {
    [, $otherWorkspace] = userWithWorkspace();
    Menu::factory()->create([
        'workspace_id' => $otherWorkspace->id,
        'slug' => 'cardapio-principal',
    ]);

    [$user, $workspace] = userWithWorkspace();

    $this->actingAs($user)
        ->post(route('workspace.menus.store', $workspace), [
            'name' => 'Cardápio Principal',
        ])
        ->assertRedirect();

    expect(Menu::query()->where('workspace_id', $workspace->id)->value('slug'))
        ->toBe('cardapio-principal-1');
});

test('a guest can view an active public menu without logging in', function () {
    $menu = Menu::factory()->create([
        'status' => MenuStatus::Active,
        'name' => 'Cardápio Principal',
        'description' => 'Os melhores produtos',
    ]);
    $visible = Product::factory()->create([
        'workspace_id' => $menu->workspace_id,
        'name' => 'X-Bacon',
        'price' => 3490,
        'active' => true,
    ]);
    $hiddenOnMenu = Product::factory()->create([
        'workspace_id' => $menu->workspace_id,
        'name' => 'Coca-Cola',
        'active' => true,
    ]);
    $hiddenCatalog = Product::factory()->inactive()->create([
        'workspace_id' => $menu->workspace_id,
        'name' => 'Pausado',
    ]);

    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'product_id' => $visible->id,
        'position' => 1,
        'active' => true,
    ]);
    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'product_id' => $hiddenOnMenu->id,
        'position' => 2,
        'active' => false,
    ]);
    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'product_id' => $hiddenCatalog->id,
        'position' => 3,
        'active' => true,
    ]);

    $this->get(route('menus.public', $menu))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/menu')
            ->where('available', true)
            ->where('workspace.name', $menu->workspace->name)
            ->where('menu.name', 'Cardápio Principal')
            ->has('products', 1)
            ->where('products.0.name', 'X-Bacon')
            ->where('products.0.price', 3490)
            ->missing('menu.id')
            ->missing('workspace.id')
            ->missing('workspace.slug'));
});

test('a draft public menu shows the unavailable page', function () {
    $menu = Menu::factory()->draft()->create();
    $product = Product::factory()->create(['workspace_id' => $menu->workspace_id]);
    MenuProduct::factory()->create([
        'menu_id' => $menu->id,
        'product_id' => $product->id,
        'active' => true,
    ]);

    $this->get(route('menus.public', $menu))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/menu')
            ->where('available', false)
            ->has('products', 0));
});

test('an inactive public menu shows the unavailable page', function () {
    $menu = Menu::factory()->inactive()->create();

    $this->get(route('menus.public', $menu))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/menu')
            ->where('available', false)
            ->has('products', 0));
});
