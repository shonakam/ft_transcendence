type ElementProps = {
  [key: string]: any;
};

// DOM要素を生成するヘルパー関数
export function h(
  tag: string,
  props: ElementProps | null,
  ...children: (Node | string)[]
) {
  const element = document.createElement(tag);

  if (props) {
    for (const key in props) {
      // イベントリスナーの登録 (例: onClick)
      if (key.startsWith('on') && typeof props[key] === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), props[key]);
      } else {
        // 属性の設定 (例: class, id)
        element.setAttribute(key, props[key]);
      }
    }
  }

  children.forEach((child) => {
    element.append(child);
  });

  return element;
}
