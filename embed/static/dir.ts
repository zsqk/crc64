type FileData = {
  size: number;
  compression: string;
  encoded: string;
};

export async function get(path: 'release.wasm'): Promise<FileData | null> {
  let fileData: FileData | null = null;
  if (path === 'release.wasm') {
    fileData = await import('./_release.wasm.ts').then(m => m.default);
  }
  if (fileData === null) return null;
  if (fileData.compression === 'gzip') {
    // TODO: use Deno std decompress
  }
  return fileData;
}
