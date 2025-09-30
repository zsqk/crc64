import * as wasmExports from "../build/release.wasm";

export const memory: WebAssembly.Memory = wasmExports.memory;

function __lowerBuffer(value: ArrayBuffer | null): number {
  if (value == null) return 0;
  const pointer = wasmExports.__new(value.byteLength, 1) >>> 0;
  new Uint8Array(memory.buffer).set(new Uint8Array(value), pointer);
  return pointer;
}

export function __liftString(pointer: number): string | null {
  if (!pointer) return null;
  const end =
    (pointer + new Uint32Array(memory.buffer)[(pointer - 4) >>> 2]) >>> 1;
  const memoryU16 = new Uint16Array(memory.buffer);
  let start = pointer >>> 1;
  let string = "";
  while (end - start > 1024) {
    string += String.fromCharCode(
      ...memoryU16.subarray(start, start += 1024),
    );
  }
  return string + String.fromCharCode(...memoryU16.subarray(start, end));
}

export function crc64(buf: ArrayBuffer | null): string {
  // assembly/crc64/crc64(~lib/arraybuffer/ArrayBuffer | null) => ~lib/string/String
  const bufPtr = __lowerBuffer(buf);
  const result = __liftString(wasmExports.crc64(bufPtr) >>> 0);
  return result || "";
}
