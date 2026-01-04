type Listener = (state: any) => void;

export default class Store {
	private listeners: Listener[] = []

	constructor(private state: any) {}

	public getState() {
		return this.state
	}

	subscribe(listener: Listener) {
    this.listeners.push(listener)
    listener(this.state)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }
}
