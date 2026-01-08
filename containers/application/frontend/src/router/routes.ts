import { Routes } from '../interface/Route';

import { HomePage } from '../pages/home/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ChatPage } from '../pages/ChatPage';
import { LocalGamePage } from '../pages/game/LocalGamePage';
import { RemoteGamePage } from '../pages/game/RemoteGamePage';

import { AuthPage } from '../pages/auth/AuthPage';
import { CallbackPage } from '../pages/auth/CallbackPage';

import { NotFoundPage } from '../pages/NotFoundPage';

export const routes: Routes = {
  '': () => new HomePage(),
  '/': () => new HomePage(),
  '/home': () => new HomePage(),
  '/about': () => new AboutPage(),
  '/dashboard': () => new DashboardPage(),
  '/game/local': () => new LocalGamePage(),
  '/game/remote': () => new RemoteGamePage(),
  '/chat': () => new ChatPage(),

  '/auth': () => new AuthPage(),
  '/auth/callback': () => new CallbackPage(),

  '/404': () => new NotFoundPage(),
};
