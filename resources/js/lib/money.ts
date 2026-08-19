const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

export function formatMoney(cents: number): string {
    return formatter.format(cents / 100);
}

export function parseMoney(value: string): number {
    const normalized = value.replace(/[^\d]/g, '');

    if (normalized === '') {
        return 0;
    }

    return Number.parseInt(normalized, 10);
}

export function centsFromReaisInput(value: string): number {
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    const amount = Number.parseFloat(cleaned);

    if (Number.isNaN(amount)) {
        return 0;
    }

    return Math.round(amount * 100);
}
