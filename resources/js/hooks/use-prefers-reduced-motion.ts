import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';

const media =
    typeof window === 'undefined' ? undefined : window.matchMedia(query);

function subscribe(callback: () => void): () => void {
    if (!media) {
        return () => {};
    }

    media.addEventListener('change', callback);

    return () => {
        media.removeEventListener('change', callback);
    };
}

function getSnapshot(): boolean {
    return media?.matches ?? false;
}

function getServerSnapshot(): boolean {
    return false;
}

export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
