import { setRenderCallback } from './ft_useState';

let rootComponent: (() => HTMLElement) | null = null;
let rootElement: HTMLElement | null = null;

// メインのコンポーネントを登録し、初回描画を行う
export function createRoot(rootEl: HTMLElement, component: () => HTMLElement) {
  rootElement = rootEl;
  rootComponent = component;
  render();
}

// 再描画関数
function render() {
  if (rootElement && rootComponent) {
    rootElement.innerHTML = ''; // 画面を一度クリア
    rootElement.appendChild(rootComponent()); // 再描画
  }
}

// useStateに、このrender関数をコールバックとして渡す
setRenderCallback(render);
