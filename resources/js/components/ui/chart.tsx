import { type ReactNode } from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<
    string,
    {
        label?: ReactNode;
        color?: string;
    }
>;

function ChartContainer({
    className,
    children,
    ...props
}: React.ComponentProps<'div'> & {
    config?: ChartConfig;
    children: React.ComponentProps<
        typeof RechartsPrimitive.ResponsiveContainer
    >['children'];
}) {
    return (
        <div
            data-slot="chart"
            className={cn('flex aspect-auto h-full w-full justify-center', className)}
            {...props}
        >
            <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
                {children}
            </RechartsPrimitive.ResponsiveContainer>
        </div>
    );
}

const ChartTooltip = RechartsPrimitive.Tooltip;
const ChartLegend = RechartsPrimitive.Legend;

export { ChartContainer, ChartTooltip, ChartLegend };
