import { decodeBase64 } from "@std/encoding/base64";

type FileData = {
  size: number;
  compression: string;
  encoded: string;
};

export async function get(path: "release.wasm"): Promise<Response> {
  let fileData: FileData | null = null;
  if (path === "release.wasm") {
    fileData = await import("./_release.wasm.ts").then((m) => m.default);
  }
  if (fileData === null) {
    throw new Error(`File not found: ${path}`);
  }
  if (fileData.compression === "gzip") {
    // Decompress gzip so that WebAssembly.compileStreaming sees raw wasm bytes.
    const compressedBytes = decodeBase64(fileData.encoded.replaceAll("\n", ""));
    // We purposely DO NOT set Content-Encoding so no further decompression attempts occur.
    const ds = new DecompressionStream("gzip");
    const decompressedStream = new Blob([compressedBytes]).stream()
      .pipeThrough(ds);
    return new Response(
      decompressedStream,
      { headers: { "Content-Type": "application/wasm" } },
    );
  } else {
    throw new Error(`Unsupported compression: ${fileData.compression}`);
  }
}
