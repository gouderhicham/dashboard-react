import { type TMenuConfig } from '@/components/menu';
import { LayoutGrid, User, Settings, BarChart3, Table, FileText, Bell } from 'lucide-react';

export const MENU_SIDEBAR: TMenuConfig = [
  {
    title: 'MENU.DASHBOARD',
    fontIcon: <LayoutGrid />,
    path: '/'
  },
  { heading: 'MENU.PAGES' },
  {
    title: 'MENU.PROFILE',
    fontIcon: <User />,
    path: '/profile'
  },
  {
    title: 'MENU.SETTINGS',
    fontIcon: <Settings />,
    path: '/settings'
  },
  {
    title: 'MENU.REPORTS',
    fontIcon: <BarChart3 />,
    children: [
      {
        title: 'MENU.SALES',
        path: '/reports/sales'
      },
      {
        title: 'MENU.TRAFFIC',
        path: '/reports/traffic'
      }
    ]
  },
  { heading: 'MENU.COMPONENTS' },
  {
    title: 'MENU.TABLES',
    fontIcon: <Table />,
    path: '/tables'
  },
  {
    title: 'MENU.FORMS',
    fontIcon: <FileText />,
    path: '/forms'
  },
  {
    title: 'MENU.NOTIFICATIONS',
    fontIcon: <Bell />,
    path: '/notifications'
  }
];
