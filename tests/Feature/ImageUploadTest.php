<?php

use App\Enums\WorkspaceRole;
use App\Models\Menu;
use App\Models\MenuSection;
use App\Models\Product;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Support\Images\ImageVariant;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

function makeImageUpload(int $width, int $height, string $name = 'photo.jpg', string $extension = 'jpg'): UploadedFile
{
    $jpeg = UploadedFile::fake()->image($name, $width, $height);

    if ($extension === 'jpg' || $extension === 'jpeg') {
        return $jpeg;
    }

    $manager = new ImageManager(new Driver);
    $image = $manager->decodeSplFileInfo($jpeg);
    $format = $extension === 'png' ? Format::PNG : Format::WEBP;
    $path = sys_get_temp_dir().'/'.$name;
    file_put_contents($path, (string) $image->encodeUsingFormat($format));

    return new UploadedFile(
        $path,
        $name,
        $extension === 'png' ? 'image/png' : 'image/webp',
        null,
        true,
    );
}

test('a jpeg png and webp product image can be uploaded and stored as webp', function (string $extension) {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => makeImageUpload(400, 400, 'photo.'.$extension, $extension),
        ])
        ->assertRedirect();

    $product->refresh();

    expect($product->image_path)->toBe(ImageVariant::ProductMain->pathFor($product->id))
        ->and($product->image_version)->toBe(1)
        ->and(Storage::disk()->exists($product->image_path))->toBeTrue()
        ->and(str_starts_with(Storage::disk()->get($product->image_path), 'RIFF'))->toBeTrue();
})->with(['jpg', 'png', 'webp']);

test('replacing a product image increments the version', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => makeImageUpload(400, 400),
        ]);

    $this->post(route('workspace.products.image.store', [$workspace, $product]), [
        'image' => makeImageUpload(500, 400, 'second.jpg'),
    ])->assertRedirect();

    expect($product->fresh()->image_version)->toBe(2);
});

test('a file larger than 10mb is rejected', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => UploadedFile::fake()->create('huge.jpg', 11 * 1024, 'image/jpeg'),
        ])
        ->assertSessionHasErrors('image');
});

test('an invalid mime is rejected', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => UploadedFile::fake()->create('notes.txt', 20, 'text/plain'),
        ])
        ->assertSessionHasErrors('image');
});

test('a spoofed image mime is rejected', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $path = sys_get_temp_dir().'/spoof.jpg';
    file_put_contents($path, 'not an image');

    $this->actingAs($user)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => new UploadedFile($path, 'photo.jpg', 'image/jpeg', null, true),
        ])
        ->assertSessionHasErrors('image');
});

test('a member cannot upload a product image', function () {
    [$owner, $workspace] = userWithWorkspace();
    $member = User::factory()->create();
    WorkspaceMember::factory()->create([
        'workspace_id' => $workspace->id,
        'user_id' => $member->id,
        'role' => WorkspaceRole::Member,
    ]);
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($member)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => makeImageUpload(400, 400),
        ])
        ->assertForbidden();
});

test('a product image from another workspace cannot be uploaded', function () {
    [$user, $workspace] = userWithWorkspace();
    $other = Workspace::factory()->create();
    $product = Product::factory()->create(['workspace_id' => $other->id]);

    $this->actingAs($user)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => makeImageUpload(400, 400),
        ])
        ->assertNotFound();
});

test('an image below the minimum dimension is rejected', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => makeImageUpload(100, 100, 'tiny.jpg'),
        ])
        ->assertSessionHasErrors('image');
});

test('an image above the maximum dimension is rejected', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => makeImageUpload(6001, 200, 'huge.jpg'),
        ])
        ->assertSessionHasErrors('image');
});

test('deleting a product image clears the path', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();
    $product = Product::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post(route('workspace.products.image.store', [$workspace, $product]), [
            'image' => makeImageUpload(400, 400),
        ]);

    $this->delete(route('workspace.products.image.destroy', [$workspace, $product]))
        ->assertRedirect();

    expect($product->fresh()->image_path)->toBeNull()
        ->and($product->fresh()->image_version)->toBe(0)
        ->and(Storage::disk()->exists(ImageVariant::ProductMain->pathFor($product->id)))->toBeFalse();
});

test('a workspace logo and cover can be uploaded', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();

    $this->actingAs($user)
        ->post(route('workspace.settings.logo.store', $workspace), [
            'image' => makeImageUpload(400, 400, 'logo.png', 'png'),
        ])
        ->assertRedirect();

    $this->post(route('workspace.settings.cover.store', $workspace), [
        'image' => makeImageUpload(1600, 900, 'cover.jpg'),
    ])->assertRedirect();

    $workspace->refresh();

    expect($workspace->logo_path)->toBe(ImageVariant::Logo->pathFor($workspace->id))
        ->and($workspace->cover_path)->toBe(ImageVariant::Cover->pathFor($workspace->id))
        ->and($workspace->logo_version)->toBe(1)
        ->and($workspace->cover_version)->toBe(1);
});

test('a menu banner and section image can be uploaded', function () {
    Storage::fake();
    [$user, $workspace] = userWithWorkspace();
    $menu = Menu::factory()->create(['workspace_id' => $workspace->id]);
    $section = MenuSection::factory()->create(['menu_id' => $menu->id]);

    $this->actingAs($user)
        ->post(route('workspace.menus.banner.store', [$workspace, $menu]), [
            'image' => makeImageUpload(1600, 900, 'banner.jpg'),
        ])
        ->assertRedirect();

    $this->post(route('workspace.menus.sections.image.store', [$workspace, $menu, $section]), [
        'image' => makeImageUpload(800, 800, 'section.png', 'png'),
    ])->assertRedirect();

    $menu->refresh();
    $section->refresh();

    expect($menu->banner_path)->toBe(ImageVariant::MenuBanner->pathFor($menu->id))
        ->and($menu->banner_version)->toBe(1)
        ->and($section->image_path)->toBe(ImageVariant::MenuSection->pathFor($section->id))
        ->and($section->image_version)->toBe(1)
        ->and(Storage::disk()->exists($menu->banner_path))->toBeTrue()
        ->and(Storage::disk()->exists($section->image_path))->toBeTrue();
});

test('application code does not mention minio or r2', function () {
    $files = collect(File::allFiles(app_path()))
        ->map(fn ($file) => File::get($file->getPathname()))
        ->implode("\n");

    expect(strtolower($files))
        ->not->toContain('minio')
        ->not->toContain('cloudflare r2')
        ->not->toContain('r2.cloudflarestorage');
});
