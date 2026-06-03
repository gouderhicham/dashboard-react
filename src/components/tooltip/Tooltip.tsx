import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

interface TooltipProps {
  title: React.ReactNode;
  placement?: TooltipPlacement;
  className?: string;
  children: React.ReactNode;
}

const splitPlacement = (placement: TooltipPlacement = 'bottom') => {
  const [side, alignSegment] = placement.split('-') as [
    'top' | 'bottom' | 'left' | 'right',
    'start' | 'end' | undefined
  ];
  return {
    side,
    align: (alignSegment ?? 'center') as 'start' | 'center' | 'end'
  };
};

const DefaultTooltip = ({ title, placement, className = '', children }: TooltipProps) => {
  const { side, align } = splitPlacement(placement);

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className="inline-flex">{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            className={`z-50 rounded-md bg-[--tw-tooltip-background-color] px-2 py-1.5 text-xs font-normal text-white shadow-md ${className}`}
          >
            {title}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export { DefaultTooltip };
export type { TooltipProps, TooltipPlacement };
