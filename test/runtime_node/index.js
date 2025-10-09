import { crc64 } from "@zsqk/crc64";

console.log(crc64(new TextEncoder().encode("Hello, world!\n")));
