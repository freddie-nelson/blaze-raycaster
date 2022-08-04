import { vec2 } from "gl-matrix";

export function clear(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function texture(
  buffer: ImageData,
  x: number,
  y1: number,
  y2: number,
  texture: ImageData,
  texX: number,
  colorMultiplier = 1,
) {
  y1 = Math.floor(y1);
  y2 = Math.floor(y2);
  y1 = y1 < y2 ? y1 : y2;
  y2 = y1 < y2 ? y2 : y1;
  texX = Math.floor(texX);

  const height = y2 - y1;
  const channels = texture.data.length === texture.width * texture.height * 4 ? 4 : 3;

  // calculate limits to avoid trying to draw outside buffer
  // also calculating limits before hand like this is more performant compared to
  // just using continue or break inside the loop
  let startY = 0;
  if (y1 < 0) startY = Math.abs(y1);

  let endY = height;
  if (y2 > buffer.height) endY = startY + buffer.height;

  for (let y = startY; y < endY; y++) {
    const pixel = ((y1 + y) * buffer.width + x) * 4;

    const texY = Math.floor((y / height) * texture.height);
    const i = (texY * texture.width + texX) * channels;

    // don't try to make this fancy (this is good for performance)
    buffer.data[pixel] = texture.data[i] * colorMultiplier;
    buffer.data[pixel + 1] = texture.data[i + 1] * colorMultiplier;
    buffer.data[pixel + 2] = texture.data[i + 2] * colorMultiplier;
    buffer.data[pixel + 3] = texture.data[i + 3];
  }
}

export function circle(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, radius, Math.PI * 2, 0, Math.PI * 2);
}

export function fillCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
  circle(ctx, cx, cy, radius);
  ctx.fillStyle = color;
  ctx.fill();
}

export function strokeCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  lineWidth: number,
) {
  circle(ctx, cx, cy, radius);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function triangle(ctx: CanvasRenderingContext2D, cx: number, cy: number, width: number, height: number) {
  const p1 = vec2.fromValues(cx, cy - height / 2);
  ctx.beginPath();
  ctx.moveTo(p1[0], p1[1]);

  const p2 = vec2.fromValues(cx - width / 2, cy + height / 2);
  ctx.lineTo(p2[0], p2[1]);

  const p3 = vec2.fromValues(cx + width / 2, cy + height / 2);
  ctx.lineTo(p3[0], p3[1]);
  ctx.lineTo(p1[0], p1[1]);
  ctx.closePath();
}

export function fillTriangle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  color: string,
) {
  triangle(ctx, cx, cy, width, height);
  ctx.fillStyle = color;
  ctx.fill();
}

export function strokeTriangle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  color: string,
  lineWidth: number,
) {
  triangle(ctx, cx, cy, width, height);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}
