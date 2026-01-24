export class ClientWsManager {
  static establishConnection(serverUrl: string): Promise<WebSocket> {
    const socket = new WebSocket(serverUrl);

		socket.onopen = () => {
      console.log('WebSocket connection established.');
    };
    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(
          `WebSocket connection closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        console.log('WebSocket connection died unexpectedly');
      }
    };
    socket.onerror = (error) => {
			console.error('WebSocket error:', error);
    };

    return socket;
  }

  static sendMessage(socket: WebSocket, message: string, data: object): void {
    const payload = {
      message,
      data,
    };
    socket.send(JSON.stringify(payload));
  }
}
