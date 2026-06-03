/* eslint-disable react-hooks/exhaustive-deps */
import { autoUpdate, flip, offset, Placement, shift, useFloating } from '@floating-ui/react-dom';
import clsx from 'clsx';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import useResponsiveProp from '@/hooks/useResponsiveProp';
import { useMatchPath } from '../../hooks/useMatchPath';
import {
  IMenuItemRef,
  IMenuItemProps,
  IMenuLabelProps,
  IMenuLinkProps,
  IMenuSubProps,
  MenuHeading,
  MenuLabel,
  MenuLink,
  MenuSub,
  TMenuDropdown,
  TMenuToggle,
  TMenuTrigger,
  IMenuToggleProps,
  MenuToggle,
  useMenu
} from './';
import { usePathname } from '@/providers';
import { getMenuLinkPath, hasMenuActiveChild } from './utils';

const extractOffset = (dropdownProps?: TMenuDropdown): { mainAxis: number; crossAxis: number } => {
  if (!dropdownProps?.modifiers) return { mainAxis: 0, crossAxis: 0 };

  const offsetModifier = dropdownProps.modifiers.find((modifier) => modifier.name === 'offset');
  const options = (offsetModifier?.options ?? {}) as { offset?: [number, number] };
  const [skid, distance] = options.offset ?? [0, 0];

  return { mainAxis: distance, crossAxis: skid };
};

const MenuItemComponent = forwardRef<IMenuItemRef | null, IMenuItemProps>(
  function MenuItem(props, ref) {
    const {
      toggle,
      trigger,
      dropdownProps,
      dropdownZIndex = 1300,
      disabled,
      tabIndex,
      className,
      handleParentHide,
      onShow,
      onHide,
      onClick,
      containerProps: ContainerPropsProp = {},
      children,
      open = false,
      parentId,
      id
    } = props;

    const { ...containerProps } = ContainerPropsProp;

    const menuItemRef = useRef<HTMLDivElement | null>(null);
    const menuContainerRef = useRef<HTMLDivElement | null>(null);

    const path = props.path || getMenuLinkPath(children);

    const {
      disabled: isMenuDisabled,
      highlight,
      multipleExpand,
      setOpenAccordion,
      isOpenAccordion,
      dropdownTimeout
    } = useMenu();
    const finalParentId = parentId !== undefined ? parentId : '';
    const finalId = id !== undefined ? id : '';

    // eslint-disable-next-line no-undef
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { pathname, prevPathname } = usePathname();

    const { match } = useMatchPath(path);

    const propToggle: TMenuToggle = useResponsiveProp(toggle, 'accordion');

    const propTrigger: TMenuTrigger = useResponsiveProp(trigger, 'click');

    const propDropdownProps = useResponsiveProp(dropdownProps) as TMenuDropdown | undefined;

    const active: boolean = highlight ? path.length > 0 && match : false;

    const [here, setHere] = useState(open);

    const accordionShow = isOpenAccordion(finalParentId, finalId);

    const [show, setShow] = useState(open);

    const [transitioning, setTransitioning] = useState(open);

    const [accordionEnter, setAccordionEnter] = useState(open);

    const hasSub = Children.toArray(children).some(
      (child) => isValidElement(child) && child.type === MenuSub
    );

    const { mainAxis, crossAxis } = extractOffset(propDropdownProps);

    const { refs, floatingStyles } = useFloating({
      open: show && propToggle === 'dropdown',
      placement: (propDropdownProps?.placement ?? 'bottom') as Placement,
      middleware: [offset({ mainAxis, crossAxis }), flip(), shift({ padding: 8 })],
      whileElementsMounted: autoUpdate,
      strategy: 'absolute'
    });

    const setMenuItemRef = useCallback(
      (node: HTMLDivElement | null) => {
        menuItemRef.current = node;
        refs.setReference(node);
      },
      [refs]
    );

    const handleHide = () => {
      if (hasSub) {
        setShow(false);
      }

      if (hasSub && propToggle === 'accordion' && multipleExpand === false) {
        setOpenAccordion(finalParentId, '');
      }

      if (handleParentHide) {
        handleParentHide();
      }
    };

    const handleShow = () => {
      if (hasSub) {
        setShow(true);
      }

      if (hasSub && propToggle === 'accordion' && multipleExpand === false) {
        setOpenAccordion(finalParentId, finalId);
      }
    };

    const handleMouseEnter = (e: MouseEvent<HTMLElement>) => {
      if (isMenuDisabled) return;

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (propTrigger === 'hover') {
        setShow(true);

        if (containerProps.onMouseEnter) {
          containerProps.onMouseEnter(e);
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent<HTMLElement>) => {
      if (isMenuDisabled) return;

      if (propTrigger === 'hover') {
        hideTimeoutRef.current = setTimeout(() => {
          setShow(false);

          if (containerProps.onMouseLeave) {
            containerProps.onMouseLeave(e);
          }

          hideTimeoutRef.current = null;
        }, dropdownTimeout);
      }
    };

    const handleToggle = (e: MouseEvent<HTMLElement>) => {
      if (isMenuDisabled) return;

      if (disabled) return;

      if (show) {
        if (propToggle === 'accordion') {
          setAccordionEnter(true);
        }

        handleHide();
      } else {
        if (propToggle === 'accordion') {
          setAccordionEnter(true);
        }

        handleShow();
      }

      if (onClick) {
        onClick(e, props);
      }
    };

    const handleClick = (e: MouseEvent<HTMLElement>) => {
      if (disabled) {
        return;
      }

      handleHide();

      if (onClick) {
        onClick(e, props);
      }
    };

    const renderLink = (child: ReactElement) => {
      const modifiedProps: IMenuLinkProps = {
        hasItemSub: hasSub,
        tabIndex,
        handleToggle,
        handleClick
      };

      return cloneElement(child, modifiedProps);
    };

    const renderToggle = (child: ReactElement) => {
      const modifiedProps: IMenuToggleProps = {
        hasItemSub: hasSub,
        tabIndex,
        handleToggle
      };

      return cloneElement(child, modifiedProps);
    };

    const renderLabel = (child: ReactElement) => {
      const modifiedProps: IMenuLabelProps = {
        hasItemSub: hasSub,
        tabIndex,
        handleToggle,
        handleClick
      };

      return cloneElement(child, modifiedProps);
    };

    const renderHeading = (child: ReactElement) => {
      return cloneElement(child);
    };

    const renderSubDropdown = (child: ReactElement) => {
      const modifiedProps: IMenuSubProps = {
        parentId: `${parentId}-${finalId}`,
        toggle: propToggle,
        handleParentHide: handleHide,
        tabIndex,
        menuItemRef: ref
      };

      const modifiedChild = cloneElement(child, modifiedProps);

      const childProps = child.props as { rootClassName?: string; baseClassName?: string };

      if (!show) return null;
      if (typeof document === 'undefined') return null;

      return createPortal(
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            zIndex: dropdownZIndex,
            pointerEvents: trigger === 'click' ? 'auto' : 'none'
          }}
          className={clsx('base-Popper-root', childProps.rootClassName)}
          data-popper-placement={propDropdownProps?.placement ?? 'bottom'}
        >
          <div
            className={clsx('menu-container', childProps.baseClassName)}
            ref={menuContainerRef}
            style={{ pointerEvents: 'auto' }}
          >
            {modifiedChild}
          </div>
        </div>,
        document.body
      );
    };

    const renderSubAccordion = (child: ReactElement) => {
      const handleEntered = () => {
        setTransitioning(true);
      };

      const handleExited = () => {
        setTransitioning(false);
        setAccordionEnter(true);
      };

      const modifiedProps: IMenuSubProps = {
        parentId: `${parentId}-${finalId}`,
        tabIndex,
        show,
        enter: accordionEnter,
        toggle: propToggle,
        handleClick,
        handleEntered,
        handleExited
      };

      return cloneElement(child, modifiedProps);
    };

    const renderChildren = () => {
      const modifiedChildren = Children.map(children, (child) => {
        if (isValidElement(child)) {
          if (child.type === MenuLink) {
            return renderLink(child);
          } else if (child.type === MenuToggle) {
            return renderToggle(child);
          } else if (child.type === MenuLabel) {
            return renderLabel(child);
          } else if (child.type === MenuHeading) {
            return renderHeading(child);
          } else if (child.type === MenuSub && propToggle === 'dropdown') {
            return renderSubDropdown(child);
          } else if (child.type === MenuSub && propToggle === 'accordion') {
            return renderSubAccordion(child);
          }
        }

        return child;
      });

      return modifiedChildren;
    };

    useImperativeHandle(
      ref,
      () => ({
        current: menuItemRef.current,
        show: () => {
          handleShow();
        },
        hide: () => {
          handleHide();
        },
        isOpen: () => {
          return show;
        }
      }),
      [show]
    );

    useEffect(() => {
      if (show) {
        if (onShow) {
          onShow();
        }
      } else {
        if (onHide) {
          onHide();
        }
      }
    }, [show]);

    useEffect(() => {
      if (propToggle === 'accordion' && multipleExpand === false) {
        setShow(accordionShow);
      }
    }, [accordionShow]);

    useEffect(() => {
      if (highlight) {
        if (hasMenuActiveChild(pathname, children)) {
          if (propToggle === 'accordion') {
            setShow(true);
          }

          setHere(true);
        } else {
          if (propToggle === 'accordion') {
            setShow(false);
          }

          setHere(false);
        }
      }

      if (prevPathname !== pathname && hasSub && propToggle === 'dropdown') {
        handleHide();
      }
    }, [pathname]);

    useEffect(() => {
      return () => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }, []);

    // Outside-click dismissal for dropdown mode
    useEffect(() => {
      if (!show || propToggle !== 'dropdown') return;

      const handlePointerDown = (event: globalThis.MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (menuItemRef.current?.contains(target)) return;
        if (menuContainerRef.current?.contains(target)) return;
        handleHide();
      };

      document.addEventListener('mousedown', handlePointerDown);
      return () => {
        document.removeEventListener('mousedown', handlePointerDown);
      };
    }, [show, propToggle]);

    return (
      <div
        {...containerProps}
        ref={setMenuItemRef}
        tabIndex={tabIndex}
        {...(propToggle === 'dropdown' && {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave
        })}
        className={clsx(
          'menu-item',
          propToggle === 'dropdown' && 'menu-item-dropdown',
          className && className,
          active && 'active',
          show && 'show',
          here && 'here',
          transitioning && 'transitioning'
        )}
      >
        {renderChildren()}
      </div>
    );
  }
);

const MenuItem = memo(MenuItemComponent);
export { MenuItem };
