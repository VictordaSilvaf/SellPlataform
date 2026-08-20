<?php

use App\Enums\SaleStatus;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

test('a sale can be created with multiple products', function () {
    [$user, $workspace] = userWithWorkspace();
    $shirt = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);
    $pants = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 15000]);

    $this->actingAs($user)
        ->post(route('workspace.sales.store', $workspace), [
            'items' => [
                ['product_id' => $shirt->id, 'quantity' => 2],
                ['product_id' => $pants->id, 'quantity' => 1],
            ],
            'status' => SaleStatus::Paid->value,
            'description' => 'Mesa 4 — pedido da noite',
        ])
        ->assertRedirect();

    $sale = Sale::query()->where('workspace_id', $workspace->id)->first();

    expect($sale)->not->toBeNull()
        ->and($sale->total)->toBe(35000)
        ->and($sale->description)->toBe('Mesa 4 — pedido da noite')
        ->and($sale->items)->toHaveCount(2)
        ->and($sale->items->first()->unit_price)->toBe(10000);
});

test('the frontend total is ignored', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($user)
        ->post(route('workspace.sales.store', $workspace), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'status' => SaleStatus::Pending->value,
            'total' => 1,
        ])
        ->assertRedirect();

    expect(Sale::query()->sole()->total)->toBe(20000)
        ->and(Sale::query()->sole()->status)->toBe(SaleStatus::Pending);
});

test('historical unit price is preserved after the product price changes', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($user)->post(route('workspace.sales.store', $workspace), [
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
        'status' => SaleStatus::Paid->value,
    ]);

    $product->update(['price' => 12000]);

    $sale = Sale::query()->with('items')->first();

    expect($sale->items->first()->unit_price)->toBe(10000)
        ->and($sale->total)->toBe(20000);
});

test('a missing product is rejected', function () {
    [$user, $workspace] = userWithWorkspace();

    $this->actingAs($user)
        ->post(route('workspace.sales.store', $workspace), [
            'items' => [['product_id' => 999, 'quantity' => 1]],
            'status' => SaleStatus::Paid->value,
        ])
        ->assertSessionHasErrors('items.0.product_id');
});

test('a product from another workspace is rejected', function () {
    [$user, $workspace] = userWithWorkspace();
    $foreign = Product::factory()->create(['price' => 10000]);

    $this->actingAs($user)
        ->post(route('workspace.sales.store', $workspace), [
            'items' => [['product_id' => $foreign->id, 'quantity' => 1]],
            'status' => SaleStatus::Paid->value,
        ])
        ->assertSessionHasErrors('items.0.product_id');
});

test('an inactive product cannot be sold', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->inactive()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($user)
        ->post(route('workspace.sales.store', $workspace), [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'status' => SaleStatus::Paid->value,
        ])
        ->assertSessionHasErrors('items.0.product_id');
});

test('an invalid quantity is rejected', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($user)
        ->post(route('workspace.sales.store', $workspace), [
            'items' => [['product_id' => $product->id, 'quantity' => 0]],
            'status' => SaleStatus::Paid->value,
        ])
        ->assertSessionHasErrors('items.0.quantity');
});

test('a pending sale can be marked as paid', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($user)->post(route('workspace.sales.store', $workspace), [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'status' => SaleStatus::Pending->value,
    ]);

    $sale = Sale::query()->first();

    $this->actingAs($user)
        ->patch(route('workspace.sales.pay', [$workspace, $sale]))
        ->assertRedirect();

    expect($sale->fresh()->status)->toBe(SaleStatus::Paid);
});

test('a sale can be cancelled from the listing flow', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($user)->post(route('workspace.sales.store', $workspace), [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'status' => SaleStatus::Pending->value,
    ]);

    $sale = Sale::query()->first();

    $this->actingAs($user)
        ->from(route('workspace.sales.index', $workspace))
        ->patch(route('workspace.sales.cancel', [$workspace, $sale]))
        ->assertRedirect(route('workspace.sales.index', $workspace));

    expect($sale->fresh()->status)->toBe(SaleStatus::Cancelled);
});

test('the sales index page is available to workspace members', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($user)->post(route('workspace.sales.store', $workspace), [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'status' => SaleStatus::Paid->value,
        'description' => 'Balcão',
    ]);

    $this->actingAs($user)
        ->get(route('workspace.sales.index', $workspace))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('sales/index')
            ->has('sales.data', 1)
            ->where('sales.data.0.description', 'Balcão'));
});

test('a user cannot view a sale from another workspace', function () {
    [$owner, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($owner)->post(route('workspace.sales.store', $workspace), [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'status' => SaleStatus::Paid->value,
    ]);

    $sale = Sale::query()->first();
    $stranger = User::factory()->create();

    $this->actingAs($stranger)
        ->get(route('workspace.sales.show', [$workspace, $sale]))
        ->assertForbidden();
});

test('a failed sale creation does not persist a partial sale', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id, 'price' => 10000]);

    $this->actingAs($user)
        ->post(route('workspace.sales.store', $workspace), [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
                ['product_id' => 999, 'quantity' => 1],
            ],
            'status' => SaleStatus::Paid->value,
        ])
        ->assertSessionHasErrors();

    expect(Sale::query()->count())->toBe(0);
});
