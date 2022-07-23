import Entity from "@/entity";
import Camera from "@/camera";

/**
 * Stores common properties and methods for controls.
 */
export default abstract class Controls {
  element: HTMLElement;
  sensitivity: number;
  movementX = 0;
  movementY = 0;

  entity?: Entity;
  camera: Camera;

  /**
   * Creates a {@link Controls} instance.
   *
   * @param element The element to use when handling control events
   * @param entity An optional entity to follow the camera's yaw
   * @param sensitivity Movement sensitivity
   */
  constructor(element: HTMLElement, camera: Camera, entity?: Entity, sensitivity = 0.1) {
    this.element = element;
    this.camera = camera;
    this.entity = entity;
    this.sensitivity = sensitivity;
  }

  /**
   * Called every tick.
   */
  abstract update(): void;

  /**
   * Removes all events used for the controls and deals with any extra cleanup needed.
   */
  abstract dispose(): void;
}
