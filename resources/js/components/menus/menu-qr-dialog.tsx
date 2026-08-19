import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useClipboard } from '@/hooks/use-clipboard';

export function MenuQrDialog({
    name,
    publicUrl,
    logoUrl,
    trigger,
}: {
    name: string;
    publicUrl: string;
    logoUrl?: string | null;
    trigger: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [, copy] = useClipboard();

    async function copyLink(): Promise<void> {
        const copied = await copy(publicUrl);

        if (copied) {
            toast.success('Link copiado');

            return;
        }

        toast.error('Não foi possível copiar o link.');
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="motion-safe:duration-200 sm:max-w-md">
                <DialogHeader className="text-center sm:text-center">
                    <DialogTitle>{name}</DialogTitle>
                    <DialogDescription>
                        Aponte a câmera para acessar o cardápio
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-2">
                    <div className="rounded-xl bg-white p-4">
                        <QRCodeSVG
                            value={publicUrl}
                            size={240}
                            className="size-60"
                            imageSettings={
                                logoUrl
                                    ? {
                                          src: logoUrl,
                                          height: 40,
                                          width: 40,
                                          excavate: true,
                                      }
                                    : undefined
                            }
                        />
                    </div>
                    <p className="w-full text-center text-sm text-muted-foreground [overflow-wrap:anywhere]">
                        {publicUrl}
                    </p>
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button type="button" onClick={copyLink}>
                        Copiar link
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <a href={publicUrl} target="_blank" rel="noreferrer">
                            Abrir cardápio
                        </a>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
