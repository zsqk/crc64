import { assert } from "@std/assert";

Deno.test("Test CRC64 release", async () => {
  const mod = await import('../src/main.ts');
  const buf = new TextEncoder().encode('Hello, world!\n').buffer;
  const v = mod.crc64(buf);
  assert(v === '14559282277039517123');
});