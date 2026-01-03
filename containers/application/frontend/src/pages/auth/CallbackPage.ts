import { toaster } from "../../components/common/Toaster";
import { design } from "../../conf";
import { Component } from "../../interface/Component";
import { router } from "../../router/router";
import { oidc } from "../../services/auth/oidc";

export class CallbackPage implements Component {
	private root: HTMLDivElement

	constructor() {
		this.root = document.createElement('div')
		this.root.className = design.bg

		this.handleCallback()
	}

	private async handleCallback() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (!code) {
      toaster.show('Authentication Failed', 'error')
      router.navigateTo('/auth')
      return
    }

    toaster.show(`OAuth code received`, 'info')

    const provider = "ft" // TODO: sessionStorage 等から取得

    try {
      await oidc(provider, code)
      router.navigateTo('/dashboard')
    } catch (err) {
      console.error(err)
      toaster.show('Login failed', 'error')
      router.navigateTo('/auth')
    }
  }

	getElement(): HTMLElement {
    return this.root
  }
}