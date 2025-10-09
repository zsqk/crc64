import { assert } from "@std/assert";

Deno.test("Test CRC64 release", async () => {
  const mod = await import("../src/mod.ts");
  const u8a = new TextEncoder().encode("Hello, world!\n");
  {
    const v = mod.crc64(u8a);
    assert(v === "14559282277039517123");
  }
  {
    const v = mod.crc64(u8a.buffer);
    assert(v === "14559282277039517123");
  }
});
