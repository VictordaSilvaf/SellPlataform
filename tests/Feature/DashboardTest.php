<?php

use App\Enums\SaleStatus;
use App\Models\Product;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users without a workspace are redirected to create one', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('workspaces.create'));
});

test('authenticated users can visit the workspace dashboard', function () {
    [$user, $workspace] = userWithWorkspace();
    $this->actingAs($user);

    $response = $this->get(route('workspace.dashboard', $workspace));
    $response->assertOk();
});

test('the dashboard includes paid sales in the received total', function () {
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create([
        'workspace_id' => $workspace->id,
        'price' => 10000,
    ]);

    $this->actingAs($user)->post(route('workspace.sales.store', $workspace), [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'status' => SaleStatus::Paid->value,
    ]);

    $this->actingAs($user)
        ->get(route('workspace.dashboard', $workspace))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/index')
            ->where('metrics.received_total', 10000)
            ->where('metrics.sales_count', 1));
});
