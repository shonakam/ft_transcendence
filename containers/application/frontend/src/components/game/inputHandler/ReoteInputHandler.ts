import { InputHandler, InputState } from '@shonakam/common/index';

export class RemoteInputHandler implements InputHandler {
  private socket: WebSocket | null = null;
  private abortController: AbortController | null = null;
  private readonly handleMessage = (event: MessageEvent) => {
    try {
      const parsed = JSON.parse(event.data);
      this.latestInput = parsed as InputState;
    } catch (error) {
      console.warn('Failed to parse remote input payload', error);
    }
  };

  latestInput: InputState;

  constructor(initialSocket?: WebSocket) {
    this.latestInput = {
      left: { direction: 'none', isStartPressed: false },
      right: { direction: 'none', isStartPressed: false },
    };
    if (initialSocket) this.attach(initialSocket);
  }

  attach(socket: WebSocket): void {
    this.detach();
    this.socket = socket;
    this.abortController = new AbortController();
    this.socket.addEventListener('message', this.handleMessage, {
      signal: this.abortController.signal,
    });
  }

  detach(options?: { close?: boolean }): void {
    this.abortController?.abort();
    this.abortController = null;
    if (options?.close && this.socket) this.socket.close();
    this.socket = null;
  }

  getInput(): InputState {
    return this.latestInput;
  }
}
