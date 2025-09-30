import { crc64 } from "@zsqk/crc64/ts";

console.log(crc64(new TextEncoder().encode("Hello, world!\n")));
