/**
 * GameCanvas.ts
 *
 * This class manages multiple layered canvases for rendering a game.
 * It creates onscreen and virtual canvases for static and dynamic content.
 */

type CanvasKey =
  | 'onscreenStatic'
  | 'onscreenDynamic'
  | 'virtualStatic'
  | 'virtualDynamic';

type RefCanvases = Record<CanvasKey, HTMLCanvasElement>;
type RefContexts = Record<CanvasKey, CanvasRenderingContext2D>;

export class GameCanvas {
  width: number;
  height: number;
  stack: HTMLElement;
  refCanvases: RefCanvases;
  refContexts: RefContexts;
  ifStaticCanvasRendered: boolean;

  constructor(stack: HTMLElement, width: number, height: number) {
    this.stack = stack;
    this.width = width;
    this.height = height;
    const keys: CanvasKey[] = [
      'onscreenStatic',
      'onscreenDynamic',
      'virtualStatic',
      'virtualDynamic',
    ];

    this.refCanvases = {} as RefCanvases;
    this.refContexts = {} as RefContexts;

    this.ifStaticCanvasRendered = false;

    this.stack.style.position = 'relative';

    for (const key of keys) {
      const cvs = document.createElement('canvas');
      cvs.className = `game-canvas-${key}`;
      cvs.width = this.width;
      cvs.height = this.height;
      cvs.style.position = 'absolute';
      cvs.style.left = '0';
      cvs.style.top = '0';
      this.stack.appendChild(cvs);
      this.refCanvases[key] = cvs;
      const ctx = cvs.getContext('2d');
      if (!ctx) throw new Error(`Failed to get 2D context for ${key}`);
      this.refContexts[key] = ctx;

      if (key.startsWith('virtual')) {
        cvs.style.display = 'none';
      }
    }
  }

  getStack(): HTMLElement {
    return this.stack;
  }

  getCanvas(key: CanvasKey): HTMLCanvasElement {
    return this.refCanvases[key];
  }

  getContext(key: CanvasKey): CanvasRenderingContext2D {
    return this.refContexts[key];
  }
}
