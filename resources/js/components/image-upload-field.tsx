import { router } from '@inertiajs/react';
import { ImageIcon, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const maxBytes = 10 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUploadField({
    label,
    imageUrl,
    storeUrl,
    destroyUrl,
    inputName,
    error,
    aspectClassName = 'aspect-square',
}: {
    label: string;
    imageUrl?: string | null;
    storeUrl?: string;
    destroyUrl?: string;
    inputName?: string;
    error?: string;
    aspectClassName?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    function validate(file: File): string | null {
        if (file.size > maxBytes) {
            return 'Arquivo muito grande';
        }

        if (!allowedTypes.includes(file.type)) {
            return 'Formato não suportado';
        }

        return null;
    }

    function previewFile(file: File): void {
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(typeof reader.result === 'string' ? reader.result : null);
        };
        reader.readAsDataURL(file);
    }

    function clearPending(): void {
        if (inputRef.current) {
            inputRef.current.value = '';
        }

        setPreview(null);
    }

    function onFile(file: File): void {
        const validationError = validate(file);

        if (validationError) {
            toast.error(validationError);
            clearPending();

            return;
        }

        previewFile(file);

        if (!storeUrl) {
            return;
        }

        setUploading(true);
        router.post(
            storeUrl,
            { image: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onError: () =>
                    toast.error('Não foi possível enviar a imagem.'),
                onFinish: () => {
                    setUploading(false);
                    setPreview(null);
                },
            },
        );
    }

    const shown = preview ?? imageUrl ?? null;
    const canRemovePending = Boolean(inputName && preview && !storeUrl);

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <button
                type="button"
                className={cn(
                    'relative flex overflow-hidden rounded-xl border bg-muted/40',
                    aspectClassName,
                )}
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
            >
                {shown ? (
                    <img
                        src={shown}
                        alt=""
                        className="size-full object-cover"
                    />
                ) : (
                    <span className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                        <ImageIcon className="size-5" />
                        <span className="text-xs">Selecionar imagem</span>
                    </span>
                )}
            </button>
            <input
                ref={inputRef}
                type="file"
                name={inputName}
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (storeUrl) {
                        event.target.value = '';
                    }

                    if (file) {
                        onFile(file);
                    }
                }}
            />
            <InputError message={error} />
            {destroyUrl && imageUrl && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                        router.delete(destroyUrl, { preserveScroll: true })
                    }
                >
                    <Trash2 />
                    Remover
                </Button>
            )}
            {canRemovePending && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-fit"
                    onClick={clearPending}
                >
                    <Trash2 />
                    Remover
                </Button>
            )}
        </div>
    );
}
