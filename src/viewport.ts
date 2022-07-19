export default class Viewport {
  constructor(readonly width: number, readonly height: number) {}

  getHalfHeight() {
    return this.height / 2;
  }

  getHalfWidth() {
    return this.width / 2;
  }
}
