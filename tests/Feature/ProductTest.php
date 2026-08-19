<?php

use App\Enums\WorkspaceRole;
use App\Models\Product;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Support\Images\ImageVariant;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('an owner can create a product', function () {
    [$user, $workspace] = userWithWorkspace();

    $this->actingAs($user)
        ->post(route('workspace.products.store', $workspace), [
            'name' => 'Camisa Preta',
            'description' => 'Tamanho M',
            'price' => 10000,
            'active' => true,
        ])
        ->assertRedirect(route('workspace.products.index', $workspace));

    expect(Product::query()->where('workspace_id', $workspace->id)->where('name', 'Camisa Preta')->exists())->toBeTrue();
});

test('a product can be created with an image', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();

    $this->actingAs($user)
        ->post(route('workspace.products.store', $workspace), [
            'name' => 'Cone de Chocolate',
            'price' => 1200,
            'image' => UploadedFile::fake()->image('photo.jpg', 400, 400),
        ])
        ->assertRedirect(route('workspace.products.index', $workspace));

    $product = Product::query()->where('name', 'Cone de Chocolate')->first();

    expect($product)->not->toBeNull()
        ->and($product->image_path)->toBe(ImageVariant::ProductMain->pathFor($product->id))
        ->and($product->image_version)->toBe(1)
        ->and(Storage::disk()->exists($product->image_path))->toBeTrue();
});

test('an invalid image is rejected when creating a product', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();

    $this->actingAs($user)
        ->post(route('workspace.products.store', $workspace), [
            'name' => 'Cone de Chocolate',
            'price' => 1200,
            'image' => UploadedFile::fake()->image('tiny.jpg', 100, 100),
        ])
        ->assertSessionHasErrors('image');

    expect(Product::query()->where('name', 'Cone de Chocolate')->exists())->toBeFalse();
});

test('a product can be updated', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($user)
        ->put(route('workspace.products.update', [$workspace, $product]), [
            'name' => 'Camisa Azul',
            'description' => 'Tamanho G',
            'price' => 12000,
            'active' => true,
        ])
        ->assertRedirect();

    expect($product->fresh()->name)->toBe('Camisa Azul')
        ->and($product->fresh()->price)->toBe(12000);
});

test('a product can be deactivated', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->patch(route('workspace.products.toggle', [$workspace, $product]))
        ->assertRedirect();

    expect($product->fresh()->active)->toBeFalse();
});

test('a product belongs to the current workspace', function () {
    [$user, $workspace] = userWithWorkspace();
    $other = Workspace::factory()->create();
    $product = Product::factory()->create(['workspace_id' => $other->id]);

    $this->actingAs($user)
        ->get(route('workspace.products.edit', [$workspace, $product]))
        ->assertNotFound();
});

test('a user from another workspace cannot access a product', function () {
    [$owner, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);
    $stranger = User::factory()->create();

    $this->actingAs($stranger)
        ->get(route('workspace.products.edit', [$workspace, $product]))
        ->assertForbidden();
});

test('a member cannot create products', function () {
    [$owner, $workspace] = userWithWorkspace();
    $member = User::factory()->create();

    WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $member->id,
        'role' => WorkspaceRole::Member,
    ]);

    $this->actingAs($member)
        ->post(route('workspace.products.store', $workspace), [
            'name' => 'Boné',
            'price' => 5000,
        ])
        ->assertForbidden();
});

test('the product list includes the image url', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);
    $product->update([
        'image_path' => ImageVariant::ProductMain->pathFor($product->id),
        'image_version' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('workspace.products.index', $workspace))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('products/index')
            ->where('products.data.0.image_url', $product->fresh()->imageUrl()));
});

test('inactive products are omitted from the sale form', function () {
    [$user, $workspace] = userWithWorkspace();
    $active = Product::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Ativo']);
    Product::factory()->inactive()->create(['workspace_id' => $workspace->id, 'name' => 'Inativo']);

    $this->actingAs($user)
        ->get(route('workspace.sales.create', $workspace))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products', 1)
            ->where('products.0.id', $active->id));
});
