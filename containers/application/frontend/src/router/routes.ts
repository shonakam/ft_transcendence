import { Routes } from '../interface/Route';

import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ChatPage } from '../pages/ChatPage';
// import { NotFoundPage } from '../pages/NotFoundPage';

export const routes: Routes = {
  '/': () => new HomePage(),
  '/home': () => new HomePage(),
  '/about': () => new AboutPage(),
  '/chat': () => new ChatPage(),
  // '/404': () => new NotFoundPage(),
};
