import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { BoardPage } from './features/canvas/board-page';
import { AlgorithmLabPage } from './features/algorithm-viz/algorithm-lab';

function RootLayout() {
  return <Outlet />;
}

const rootRoute = createRootRoute({ component: RootLayout });
const indexRoute = createRoute({ 
  getParentRoute: () => rootRoute, 
  path: '/', 
  beforeLoad: () => { throw redirect({ to: '/board/$boardId', params: { boardId: 'new' } }); }
});
const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/dashboard', component: DashboardPage });
const boardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/board/$boardId', component: BoardPage });
const algorithmRoute = createRoute({ getParentRoute: () => rootRoute, path: '/algorithm', component: AlgorithmLabPage });

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, boardRoute, algorithmRoute]);
export const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
