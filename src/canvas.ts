export function resizeCanvas(canvas: HTMLCanvasElement, renderScale: number) {
  const width = Math.floor(canvas.clientWidth * renderScale);
  const height = Math.floor(canvas.clientHeight * renderScale);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}
