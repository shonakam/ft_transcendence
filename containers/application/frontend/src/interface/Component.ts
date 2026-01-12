export interface Component {
  getElement(): HTMLElement;
  destroy(): void;
}
