<?php

namespace App\Support\Images;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;
use Throwable;

class ImageUploadService
{
    public function store(UploadedFile $file, ImageVariant $variant, int $id): string
    {
        $this->assertSize($file);
        $this->assertMime($file);

        $image = $this->decode($file);
        $this->assertDimensions($image);

        $settings = $variant->settings();

        if ($settings['mode'] === 'cover') {
            $image->cover($settings['max_width'], $settings['max_height']);
        } else {
            $image->scaleDown($settings['max_width'], $settings['max_height']);
        }

        $encoded = $image->encodeUsingFormat(
            Format::WEBP,
            quality: (int) config('images.quality'),
            strip: true,
        );
        $path = $variant->pathFor($id);

        Storage::disk($this->disk())->put($path, (string) $encoded, 'public');

        return $path;
    }

    public function delete(ImageVariant $variant, int $id): void
    {
        $path = $variant->pathFor($id);

        Storage::disk($this->disk())->delete($path);
    }

    private function disk(): string
    {
        return (string) config('filesystems.default');
    }

    private function assertSize(UploadedFile $file): void
    {
        $max = (int) config('images.max_upload_bytes');

        if ($file->getSize() > $max) {
            throw ValidationException::withMessages([
                'image' => 'O arquivo é muito grande. O limite é de 10 MB.',
            ]);
        }
    }

    private function assertMime(UploadedFile $file): void
    {
        /** @var list<string> $allowed */
        $allowed = config('images.allowed_mimes');

        if (! in_array($file->getMimeType(), $allowed, true)) {
            throw ValidationException::withMessages([
                'image' => 'Formato não suportado. Envie JPEG, PNG ou WebP.',
            ]);
        }
    }

    private function decode(UploadedFile $file): ImageInterface
    {
        try {
            return (new ImageManager(new Driver))->decodeSplFileInfo($file);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'image' => 'Não foi possível ler a imagem.',
            ]);
        }
    }

    private function assertDimensions(ImageInterface $image): void
    {
        $min = (int) config('images.min_dimension');
        $max = (int) config('images.max_dimension');
        $width = $image->width();
        $height = $image->height();

        if ($width < $min || $height < $min) {
            throw ValidationException::withMessages([
                'image' => 'A imagem é muito pequena. O mínimo é 200×200.',
            ]);
        }

        if ($width > $max || $height > $max) {
            throw ValidationException::withMessages([
                'image' => 'A imagem é muito grande. O máximo é 6000×6000.',
            ]);
        }
    }
}
