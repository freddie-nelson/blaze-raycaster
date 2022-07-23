import { glMatrix, vec3 } from "gl-matrix";
import Camera from "@/camera";
import Controls from "./controls";
import Entity from "@/entity";

export default class PointerLockControls extends Controls {
  isLocked = false;

  /**
   * Creates a {@link PointerLockControls} instance and sets up it's event handlers.
   *
   * @param element The element to use when handling control events
   * @param camera The camera to control
   * @param entity An optional entity to follow the camera's yaw
   * @param sensitivity Movement sensitivity
   */
  constructor(element: HTMLElement, camera: Camera, entity?: Entity, sensitivity = 0.2) {
    super(element, camera, entity, sensitivity);

    element.addEventListener("click", this.clickHandler);
    document.addEventListener("pointerlockchange", this.pointerLockChangeHandler);
    element.addEventListener("mousemove", this.mouseMoveHandler);
  }

  /**
   * Requests pointer lock if the control's are not already locked.
   */
  private clickHandler = () => {
    if (!this.isLocked) this.element.requestPointerLock();
  };

  /**
   * Resets `movementX` and `movementY` if the controls have been unlocked.
   */
  private pointerLockChangeHandler = () => {
    this.isLocked = !this.isLocked;

    if (!this.isLocked) {
      this.movementX = 0;
      this.movementY = 0;
    }
  };

  /**
   * Syncs `this.movementX` and `this.movementY` with the event's movement properties.
   *
   * @param e The mouse event
   */
  private mouseMoveHandler = (e: MouseEvent) => {
    if (this.isLocked) {
      this.movementX = e.movementX;
      this.movementY = e.movementY;
    }
  };

  /**
   * Calculates the new camera direction from `movementX` and `movementY`.
   *
   * Called every tick.
   */
  update() {
    if (!this.isLocked) return;

    const angle = (this.movementX / this.camera.viewport.width) * Math.PI * this.sensitivity;
    this.camera.rotate(angle);

    this.movementX = 0;
    this.movementY = 0;
  }

  dispose() {
    this.element.removeEventListener("click", this.clickHandler);
    document.removeEventListener("pointerlockchange", this.pointerLockChangeHandler);
    this.element.removeEventListener("mousemove", this.mouseMoveHandler);
  }
}
