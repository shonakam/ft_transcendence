import { Routes } from '../interface/Route';

import { HomePage } from '../pages/home/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AuthPage } from '../pages/auth/AuthPage';
// import { NotFoundPage } from '../pages/NotFoundPage';

export const routes: Routes = {
  '/': () => new HomePage(),
  '/auth': () => new AuthPage(),
  '/home': () => new HomePage(),
  '/about': () => new AboutPage(),
  '/dashboard': () => new DashboardPage(),
  // '/404': () => new NotFoundPage(),
};
