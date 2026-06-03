import { Children, isValidElement, ReactNode } from 'react';
import { MenuLink } from './MenuLink';
import { matchPath } from 'react-router';

export const getMenuLinkPath = (children: ReactNode): string => {
  let path = '';

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === MenuLink) {
      const childProps = child.props as { path?: string };
      if (childProps.path) {
        path = childProps.path; // Assign the path when found
      }
    }
  });

  return path;
};

export const hasMenuActiveChild = (path: string, children: ReactNode): boolean => {
  const childrenArray: ReactNode[] = Children.toArray(children);

  for (const child of childrenArray) {
    if (isValidElement(child)) {
      const childProps = child.props as { path?: string; children?: ReactNode };

      if (child.type === MenuLink && childProps.path) {
        if (path === '/') {
          if (childProps.path === path) {
            return true;
          }
        } else {
          if (matchPath(childProps.path as string, path)) {
            return true;
          }
        }
      } else if (hasMenuActiveChild(path, childProps.children as ReactNode)) {
        return true;
      }
    }
  }

  return false;
};
