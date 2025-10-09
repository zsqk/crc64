type FileData = {
  size: number;
  compression: string;
  encoded: string;
};

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function get(path: 'release.wasm'): Promise<Response> {
  let fileData: FileData | null = null;
  if (path === 'release.wasm') {
    fileData = await import('./_release.wasm.ts').then(m => m.default);
  }
  if (fileData === null) {
    throw new Error(`File not found: ${path}`);
  };
  if (fileData.compression === 'gzip') {
    // 使用 Web API 的 DecompressionStream 解 gzip（Deno 支持）
    const compressedBytes = base64ToBytes(fileData.encoded.replaceAll('\n', ''));
    const blob = new Blob([compressedBytes]);
    const ds = new DecompressionStream('gzip');
    const decompressedStream = blob.stream().pipeThrough(ds);
    return new Response(decompressedStream);
  } else {
    throw new Error(`Unsupported compression: ${fileData.compression}`);
  }
}
