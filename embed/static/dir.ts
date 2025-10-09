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
    // We purposely DO NOT set Content-Encoding so no further decompression attempts occur.
    const compressedBytes = decodeBase64(fileData.encoded.replaceAll("\n", ""));
    try {
      const ds = new DecompressionStream("gzip");
      const decompressedStream = new Blob([compressedBytes]).stream().pipeThrough(ds);
      // Materialize into ArrayBuffer (compileStreaming accepts a Response stream, but
      // we want to know uncompressed size for Content-Length correctness and avoid
      // any subtle stream locking issues in older runtimes.)
      const decompressedResp = new Response(decompressedStream);
      const decompressedBuffer = await decompressedResp.arrayBuffer();
      return new Response(decompressedBuffer, {
        headers: {
          // fileData.size is expected to be the original (uncompressed) size.
          "Content-Length": fileData.size.toString(),
          "Content-Type": "application/wasm",
        },
      });
    } catch (err) {
      throw new Error(`Failed to decompress embedded wasm: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    throw new Error(`Unsupported compression: ${fileData.compression}`);
  }
}
