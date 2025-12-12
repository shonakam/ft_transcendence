import { Routes } from '../interface/Route';

import { HomePage } from '../pages/home/HomePage';
import { AboutPage } from '../pages/AboutPage';
// import { NotFoundPage } from '../pages/NotFoundPage';

export const routes: Routes = {
  '/': () => new HomePage(),
  '/home': () => new HomePage(),
  '/about': () => new AboutPage(),
  // '/404': () => new NotFoundPage(),
};
