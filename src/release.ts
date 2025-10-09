// deno-lint-ignore-file no-process-global

interface ImportObject {
  env?: Record<string, WebAssembly.ExportValue>;
}

interface AdaptedImports {
  env: {
    abort(
      message: number,
      fileName: number,
      lineNumber: number,
      columnNumber: number,
    ): void;
  } & Record<string, WebAssembly.ExportValue>;
}

interface WasmExports {
  memory?: WebAssembly.Memory;
  crc64(buf: number): number;
  __new(size: number, id: number): number;
}

interface AdaptedExports {
  crc64(buf: ArrayBuffer | null): string;
  memory: WebAssembly.Memory;
}

async function instantiate(
  module: WebAssembly.Module,
  imports: ImportObject = {},
): Promise<AdaptedExports> {
  const adaptedImports: AdaptedImports = {
    env: Object.setPrototypeOf(
      {
        abort(
          message: number,
          fileName: number,
          lineNumber: number,
          columnNumber: number,
        ): void {
          // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
          const messageStr = __liftString(message >>> 0);
          const fileNameStr = __liftString(fileName >>> 0);
          const lineNum = lineNumber >>> 0;
          const columnNum = columnNumber >>> 0;
          (() => {
            // @external.js
            throw Error(
              `${messageStr} in ${fileNameStr}:${lineNum}:${columnNum}`,
            );
          })();
        },
      },
      Object.assign(Object.create(globalThis), imports.env || {}),
    ),
  };

  const { exports } = await WebAssembly.instantiate(
    module,
    adaptedImports as unknown as WebAssembly.Imports,
  );
  const wasmExports = exports as unknown as WasmExports;
  const memory = wasmExports.memory ||
    (imports.env as Record<string, WebAssembly.ExportValue>)
      ?.memory as WebAssembly.Memory;

  const adaptedExports = Object.setPrototypeOf(
    {
      crc64(buf: ArrayBuffer | null): string {
        // assembly/crc64/crc64(~lib/arraybuffer/ArrayBuffer | null) => ~lib/string/String
        const bufPtr = __lowerBuffer(buf);
        const result = __liftString(wasmExports.crc64(bufPtr) >>> 0);
        return result || "";
      },
    },
    wasmExports,
  ) as AdaptedExports;

  function __lowerBuffer(value: ArrayBuffer | null): number {
    if (value == null) return 0;
    const pointer = wasmExports.__new(value.byteLength, 1) >>> 0;
    new Uint8Array(memory.buffer).set(new Uint8Array(value), pointer);
    return pointer;
  }

  function __liftString(pointer: number): string | null {
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

  return adaptedExports;
}

const exportObj = await (async (url: URL) =>
  instantiate(
    await (async (): Promise<WebAssembly.Module> => {
      const isDeno: boolean = typeof Deno != "undefined";
      const isNodeOrBun: boolean = typeof process != "undefined" &&
        process.versions != null &&
        (process.versions.node != null || process.versions.bun != null);
      if (isDeno) {
        console.log("Using embedder to load WASM");
        const { get } = await import("../embed/static/dir.ts");
        const res = await get("release.wasm");
        if (!res) {
          throw new Error("Failed to load release.wasm from embedder");
        }
        return globalThis.WebAssembly.compile(
          await res.bytes() as Uint8Array<ArrayBuffer>,
        );
      }
      if (isNodeOrBun && !isDeno) {
        console.log("Using node:fs to load WASM", url);
        const fileData = await (await import("node:fs/promises")).readFile(url);
        return globalThis.WebAssembly.compile(new Uint8Array(fileData).buffer);
      } else {
        console.log("Using fetch to load WASM", url);
        return await globalThis.WebAssembly.compileStreaming(
          globalThis.fetch(url),
        );
      }
    })(),
    {},
  ))(new URL("release.wasm", import.meta.url));

export const memory: WebAssembly.Memory = exportObj.memory;
export const crc64: (buf: ArrayBuffer | null) => string = exportObj.crc64;
