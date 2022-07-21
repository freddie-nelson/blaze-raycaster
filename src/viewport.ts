export default class Viewport {
  constructor(public width: number, public height: number) {}

  getHalfHeight() {
    return this.height / 2;
  }

  getHalfWidth() {
    return this.width / 2;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
