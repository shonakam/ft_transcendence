import { Routes } from '../interface/Route';

import { HomePage } from '../pages/home/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ChatPage } from '../pages/ChatPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AuthPage } from '../pages/auth/AuthPage';
import { GamePage } from '../pages/GamePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const routes: Routes = {
  '/': () => new HomePage(),
  '/auth': () => new AuthPage(),
  '/home': () => new HomePage(),
  '/about': () => new AboutPage(),
  '/chat': () => new ChatPage(),
  '/dashboard': () => new DashboardPage(),
  '/game': () => new GamePage(),
  '/404': () => new NotFoundPage(),
};
