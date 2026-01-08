import { Routes } from '../interface/Route';

import { HomePage } from '../pages/home/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ChatPage } from '../pages/ChatPage';
import { AuthPage } from '../pages/auth/AuthPage';
import { GamePage } from '../pages/GamePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const routes: Routes = {
  '/': () => new HomePage(),
  '/auth': () => new AuthPage(),
  '/home': () => new HomePage(),
  '/about': () => new AboutPage(),
  '/dashboard': () => new DashboardPage(),
  '/game': () => new GamePage(),
  '/chat': () => new ChatPage(),
  '/404': () => new NotFoundPage(),
};
