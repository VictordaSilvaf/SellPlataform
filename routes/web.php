<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeRedirectController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuProductController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PublicMenuController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceMemberController;
use App\Http\Controllers\WorkspacePlanController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('cardapio/{menu:slug}', PublicMenuController::class)->name('menus.public');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', HomeRedirectController::class)->name('dashboard');

    Route::get('workspaces/create', [WorkspaceController::class, 'create'])->name('workspaces.create');
    Route::post('workspaces', [WorkspaceController::class, 'store'])->name('workspaces.store');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('invitations/accept', [NotificationController::class, 'accept'])->name('invitations.accept');
    Route::post('invitations/reject', [NotificationController::class, 'reject'])->name('invitations.reject');
});

Route::middleware(['auth', 'verified', 'workspace.member'])
    ->prefix('app/{workspace:slug}')
    ->name('workspace.')
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::patch('products/{product}/toggle', [ProductController::class, 'toggle'])->name('products.toggle');

        Route::get('menus', [MenuController::class, 'index'])->name('menus.index');
        Route::get('menus/create', [MenuController::class, 'create'])->name('menus.create');
        Route::post('menus', [MenuController::class, 'store'])->name('menus.store');
        Route::get('menus/{menu}', [MenuController::class, 'show'])->name('menus.show');
        Route::put('menus/{menu}', [MenuController::class, 'update'])->name('menus.update');
        Route::delete('menus/{menu}', [MenuController::class, 'destroy'])->name('menus.destroy');
        Route::post('menus/{menu}/products', [MenuProductController::class, 'store'])->name('menus.products.store');
        Route::patch('menus/{menu}/products/order', [MenuProductController::class, 'order'])->name('menus.products.order');
        Route::delete('menus/{menu}/products/{product}', [MenuProductController::class, 'destroy'])->name('menus.products.destroy');
        Route::patch('menus/{menu}/products/{product}/toggle', [MenuProductController::class, 'toggle'])->name('menus.products.toggle');

        Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
        Route::get('sales/create', [SaleController::class, 'create'])->name('sales.create');
        Route::post('sales', [SaleController::class, 'store'])->name('sales.store');
        Route::get('sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
        Route::patch('sales/{sale}/pay', [SaleController::class, 'markPaid'])->name('sales.pay');
        Route::patch('sales/{sale}/cancel', [SaleController::class, 'cancel'])->name('sales.cancel');

        Route::get('settings', [WorkspaceController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [WorkspaceController::class, 'update'])->name('settings.update');
        Route::delete('settings', [WorkspaceController::class, 'destroy'])->name('settings.destroy');

        Route::get('settings/members', [WorkspaceMemberController::class, 'index'])->name('members.index');
        Route::post('settings/members', [WorkspaceMemberController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('members.store');
        Route::patch('settings/members/{member}', [WorkspaceMemberController::class, 'update'])->name('members.update');
        Route::delete('settings/members/{member}', [WorkspaceMemberController::class, 'destroy'])->name('members.destroy');
        Route::delete('settings/invitations/{invitation}', [WorkspaceMemberController::class, 'destroyInvitation'])->name('invitations.destroy');
        Route::post('settings/invitations/{invitation}/resend', [WorkspaceMemberController::class, 'resendInvitation'])
            ->middleware('throttle:6,1')
            ->name('invitations.resend');

        Route::get('settings/plan', WorkspacePlanController::class)->name('plan.show');
    });

require __DIR__.'/settings.php';
