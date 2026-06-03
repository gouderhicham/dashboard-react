import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import clsx from 'clsx';
import { Children, cloneElement, forwardRef, isValidElement, memo, useEffect, useRef } from 'react';
import { IMenuItemProps, IMenuSubProps, MenuItem } from './';

const MenuSubComponent = forwardRef<HTMLDivElement | null, IMenuSubProps>(
  function MenuSub(props, ref) {
    const {
      show,
      toggle = 'accordion',
      className,
      handleParentHide,
      handleEntered,
      handleExited,
      children,
      parentId
    } = props;

    const finalParentId = parentId !== undefined ? parentId : 'root';
    const previousShow = useRef<boolean | undefined>(show);

    useEffect(() => {
      if (toggle !== 'accordion') return;
      if (previousShow.current === show) return;
      previousShow.current = show;
      if (show) {
        handleEntered?.();
      } else {
        handleExited?.();
      }
    }, [show, toggle, handleEntered, handleExited]);

    const modifiedChildren = Children.map(children, (child, index) => {
      if (isValidElement(child)) {
        if (child.type === MenuItem) {
          const modifiedProps: IMenuItemProps = {
            handleParentHide,
            parentId: finalParentId,
            id: `${finalParentId}-${index}`
          };

          return cloneElement(child, modifiedProps);
        } else {
          return cloneElement(child);
        }
      }

      return child;
    });

    const containerClassName = clsx(
      toggle === 'accordion' && 'menu-accordion',
      toggle === 'dropdown' && 'menu-dropdown',
      className && className
    );

    if (toggle === 'accordion') {
      return (
        <CollapsiblePrimitive.Root open={!!show} asChild>
          <div ref={ref} className={containerClassName}>
            <CollapsiblePrimitive.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
              {modifiedChildren}
            </CollapsiblePrimitive.Content>
          </div>
        </CollapsiblePrimitive.Root>
      );
    }

    return (
      <div ref={ref} className={containerClassName} data-popper-placement="bottom">
        {modifiedChildren}
      </div>
    );
  }
);

const MenuSub = memo(MenuSubComponent);
export { MenuSub };
