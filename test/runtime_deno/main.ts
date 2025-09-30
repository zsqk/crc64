import { crc64 } from "@zsqk/crc64";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log(crc64(new TextEncoder().encode("Hello, world!\n").buffer));
}
