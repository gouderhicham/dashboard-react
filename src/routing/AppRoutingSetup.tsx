import { lazy, ReactElement, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { RequireAuth } from '@/auth/RequireAuth';
import { ScreenLoader } from '@/components/loaders';

// Helper: lazy-load a named export as default for React.lazy
const lazyNamed = <K extends string>(
  loader: () => Promise<Record<K, React.ComponentType<unknown>>>,
  name: K
) =>
  lazy(() =>
    loader().then((module) => ({
      default: module[name]
    }))
  );

const AuthPage = lazyNamed(() => import('@/auth'), 'AuthPage');
const Demo1Layout = lazyNamed(() => import('@/layouts/demo1'), 'Demo1Layout');
const ErrorsRouting = lazyNamed(() => import('@/errors'), 'ErrorsRouting');

// Dashboards
const DefaultPage = lazyNamed(
  () => import('@/pages/dashboards/default/DefaultPage'),
  'DefaultPage'
);

// Test pages
const BlankPage = lazyNamed(() => import('@/pages/testing/BlankPage'), 'BlankPage');

const AppRoutingSetup = (): ReactElement => {
  return (
    <Suspense fallback={<ScreenLoader />}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route element={<Demo1Layout />}>
            <Route path="/" element={<DefaultPage />} />
            <Route path="/profile" element={<BlankPage />} />
            <Route path="/settings" element={<BlankPage />} />
            <Route path="/reports/sales" element={<BlankPage />} />
            <Route path="/reports/traffic" element={<BlankPage />} />
            <Route path="/tables" element={<BlankPage />} />
            <Route path="/forms" element={<BlankPage />} />
            <Route path="/notifications" element={<BlankPage />} />
          </Route>
        </Route>
        <Route path="error/*" element={<ErrorsRouting />} />
        <Route path="auth/*" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/error/404" />} />
      </Routes>
    </Suspense>
  );
};

export { AppRoutingSetup };
