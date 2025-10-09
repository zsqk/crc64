# crc64

CRC64 ECMA-182 WASM for Deno and Node.js (Browser).

- use AssemblyScript.
- use Deno runtime.

Publish via jsr.io and GitHub Actions.

## Usage

```ts
const { crc64 } = await import('@zsqk/crc64');
const hash = crc64(new TextEncoder().encode('Hello, world!\n').buffer);
```
