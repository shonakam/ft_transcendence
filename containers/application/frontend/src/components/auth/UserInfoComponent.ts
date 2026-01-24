// src/components/dashboard/UserInfoComponent.ts
import { Component } from '../../interface/Component';
import { UserResponse } from '../../types/user';

export class UserInfoComponent implements Component {
  private el: HTMLDivElement;
  private readonly DEFAULT_IMAGE = '/assets/default-profile.png';

  constructor(user: UserResponse) {
    this.el = document.createElement('div');
    this.el.className = 'mb-8 text-slate-300 text-sm';
    this.render(user);
  }

  private render(user: UserResponse) {
    // user profile
	const imgContainer = document.createElement('div');
	imgContainer.className = 'flex justify-center mb-6';
	
	const img = document.createElement('img');
	img.src = (user.imagePath) ? `/api/${user.imagePath}` : this.DEFAULT_IMAGE;
    img.alt = `${user.username} profile`;
	img.className = 'w-24 h-24 rounded-full object-cover border-4 border-white/10 shadow-lg';
	imgContainer.appendChild(img);
    this.el.appendChild(imgContainer);

	// user name
	const userRow = this.createRow('User: ', user.username, 'text-white font-medium');

	// user email
	const emailRow = this.createRow('Email: ', user.email, 'text-slate-300');

    // mfa status
    const mfaColorClass = user.is2faEnabled ? 'text-green-400' : 'text-red-400';
    const mfaText = user.is2faEnabled ? 'Enabled' : 'Disabled';
    
    const mfaRow = this.createRow(
      'MFA Status: ',
      mfaText,
      `${mfaColorClass} font-bold`
    );

    this.el.append(imgContainer, userRow, emailRow, mfaRow);
  }

  private createRow(label: string, value: string, valueClass: string): HTMLParagraphElement {
    const p = document.createElement('p');
    p.textContent = label;

    const span = document.createElement('span');
    span.className = valueClass;
    span.textContent = value;

    p.appendChild(span);
    return p;
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  public destroy(): void {
	this.el.remove();
  }
}