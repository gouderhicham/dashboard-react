import { Fragment, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Outlet, useLocation } from 'react-router';
import { useMenuCurrentItem } from '@/components/menu';
import { Header, Sidebar, useDemo1Layout } from '../';
import { useMenus } from '@/providers';

const Main = () => {
  const intl = useIntl();
  const { layout } = useDemo1Layout();
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('primary');
  const menuItem = useMenuCurrentItem(pathname, menuConfig);

  // Set title manually (more reliable than Helmet alone)
  useEffect(() => {
    document.title = menuItem?.title ? intl.formatMessage({ id: menuItem.title }) : 'My App';
  }, [menuItem?.title, intl]);

  useEffect(() => {
    const bodyClass = document.body.classList;

    // Add a class to the body element
    bodyClass.add('demo1');

    if (layout.options.sidebar.fixed) bodyClass.add('sidebar-fixed');
    if (layout.options.sidebar.collapse) bodyClass.add('sidebar-collapse');
    if (layout.options.header.fixed) bodyClass.add('header-fixed');

    // Remove the class when the component is unmounted
    return () => {
      bodyClass.remove('demo1');
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('sidebar-collapse');
      bodyClass.remove('header-fixed');
    };
  }, [layout]);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add('layout-initialized');
    }, 1000); // 1000 milliseconds

    // Remove the class when the component is unmounted
    return () => {
      document.body.classList.remove('layout-initialized');
      clearTimeout(timer);
    };
  }, []);

  return (
    <Fragment>
      <Sidebar />

      <div className="wrapper flex grow flex-col">
        <Header />

        <main className="grow content pt-5" role="content">
          <Outlet />
        </main>
      </div>
    </Fragment>
  );
};

export { Main };