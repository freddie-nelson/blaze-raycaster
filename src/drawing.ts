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
