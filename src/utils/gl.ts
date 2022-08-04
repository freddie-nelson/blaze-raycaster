import Logger from "../logger";
import { TextureUnit } from "../texture/texture";
import Color from "./color";

/**
 * Stores information about a {@link WebGLProgram}, such as it's attribute and uniform locations.
 */
export interface ShaderProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    [index: string]: number;
  };
  uniformLocations: {
    [index: string]: WebGLUniformLocation;
    opacity?: WebGLUniformLocation;
    zIndex: WebGLUniformLocation;
    texture?: WebGLUniformLocation;
  };
}

/**
 * Creates and compiles a shader from its source.
 *
 * @param gl The webgl context to use when creating the shader
 * @param type The type of shader to create (either `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`)
 * @param source The shader source as a string
 * @returns The compiled shader or undefined if there was an error when creating the shader
 */
export function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.error("Failed to create shader: " + gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

/**
 * Creates a {@link WebGLProgram} instance with a vertex and fragment shader.
 *
 * @param gl The webgl context to use when creating the program
 * @param vertexShader The vertex shader of the program
 * @param fragmentShader The fragment shader of the program
 * @returns The created program or undefined if there was an error when creating the program
 */
export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.error("Failed to create program: " + gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

/**
 * Creates each webgl shader and links them together in a {@link WebGLProgram}
 *
 * @param gl The webgl context to use when creating the shaders
 * @param vsSource The source of the vertex shader as a string
 * @param fsSource The source of the fragment shader as a string
 * @returns The created {@link WebGLProgram} instance
 */
export function createShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return;

  return createProgram(gl, vertexShader, fragmentShader);
}

/**
 * Clears the color and depth buffer of the webgl context.
 *
 * @param gl The webgl context to clear
 * @param color The color to use as the clear color
 */
export function clear(gl: WebGL2RenderingContext, color: Color = new Color("#000")) {
  gl.clearColor(color.webgl[0], color.webgl[1], color.webgl[2], color.webgl[3]);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

/**
 * Creates a {@link WebGLTexture} and loads an image onto it.
 *
 * @param gl The {@link WebGL2RenderingContext} to use to load the texture
 * @param textureUnit The texture unit to to take the {@link Texture} from and to bind the {@link WebGLTexture} to
 * @returns The WebGL texture that was created
 */
export function loadTexture(gl: WebGL2RenderingContext, textureUnit: TextureUnit) {
  const texture = textureUnit.texture;
  if (!texture) return void Logger.error("GL", "No texture in unit provided to loadTexture.");

  gl.activeTexture(textureUnit.unit);

  const glTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, glTexture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([
    texture.color.rgba.r,
    texture.color.rgba.g,
    texture.color.rgba.b,
    (texture.color.rgba.a || 0) * 255,
  ]);

  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

  if (texture.image) {
    gl.activeTexture(textureUnit.unit);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, texture.image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 5);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  return glTexture;
}
