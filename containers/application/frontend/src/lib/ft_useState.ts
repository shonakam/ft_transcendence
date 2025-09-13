// 状態が変更されたときに実行するコールバックを保持
let renderCallback: (() => void) | null = null;

// 状態（state）とそれを更新する関数（setter）を返す
export function useState<T>(initialValue: T): [() => T, (newValue: T) => void] {
  let state = initialValue;

  const getState = () => state;
  const setState = (newValue: T) => {
    state = newValue;
    if (renderCallback) renderCallback();
  };

  return [getState, setState];
}

// 再描画用の関数を登録する
export function setRenderCallback(callback: () => void) {
  renderCallback = callback;
}
