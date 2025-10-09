type FileData = {
  size: number;
  compression: string;
  encoded: string;
};

export async function get(path: '_release.wasm.ts'): Promise<FileData | null> {
  let fileData: FileData | null = null;
  if (path === '_release.wasm.ts') {
    fileData = await import('./_release.wasm.ts').then(m => m.default);
  }
  if (fileData === null) return null;
  if (fileData.compression === 'gzip') {
    // TODO: use Deno std decompress
  }
  return fileData;
}
