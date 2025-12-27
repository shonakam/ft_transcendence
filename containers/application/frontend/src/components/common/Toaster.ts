export type ToastType = 'success' | 'error' | 'info'

class Toaster {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div')
    this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col space-y-3 pointer-events-none'
    document.body.appendChild(this.container);
  }

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const toast = document.createElement('div')

    toast.className = `
      min-w-[280px] px-6 py-4 rounded-xl shadow-2xl text-white font-medium
      transform opacity-0 translate-x-12
      transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
      pointer-events-auto cursor-pointer
      ${type === 'success' ? 'bg-emerald-500/95' : type === 'error' ? 'bg-rose-500/95' : 'bg-indigo-600/95'}
      backdrop-blur-md border border-white/20
    `
    toast.textContent = message
    this.container.appendChild(toast)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-x-12')
        toast.classList.add('translate-x-0')
      })
    })

    const removeToast = () => {
      toast.classList.add('opacity-0', 'translate-x-8')
      toast.addEventListener('transitionend', () => {
        toast.remove()
      }, { once: true })
    }

    toast.onclick = removeToast
    setTimeout(removeToast, duration)
  }
}

export const toaster = new Toaster()
