import { api } from '../lib/httpClient';
import { Component } from '../interface/Component';
import { UserResponse } from '../services/user/dashboard';

export class DashboardPage implements Component {
  private el: HTMLElement

  constructor() {
    this.el = document.createElement('main')
    this.el.className = ''
    this.init()
  }

  private async init() {
    try {
      const user = await api.get<UserResponse>('users/me')
      this.render(user)
    } catch (error) {
      console.error("ユーザー情報の取得に失敗しました", error)
    }
  }

  private render(user: any) {
    this.el.innerHTML = `
      <h1 class="text-2xl font-bold">おかえりなさい、${user.name}さん！</h1>
      <div class="mt-4 p-4 bg-gray-100 rounded">
        <p>メールアドレス: ${user.email}</p>
        <p>ユーザーID: ${user.id}</p>
      </div>
    `
  }

  public getElement(): HTMLElement {
    return this.el
  }
}
