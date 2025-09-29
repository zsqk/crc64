// 使用 AssemblyScript 实现 crc64-ecma182, 传入 ArrayBuffer, 返回字符串

const POLY: u64 = 0xc96c5795d7870f42;

let _inited: bool = false;
let _table = new Array<u64>(256);

function initTable(): void {
  if (_inited) return;
  _inited = true;

  for (let n = 0; n < 256; n++) {
    let crc: u64 = <u64>n;
    for (let k = 0; k < 8; k++) {
      if ((crc & 1) != 0) {
        crc = POLY ^ (crc >> 1);
      } else {
        crc = crc >> 1;
      }
    }
    _table[n] = crc;
  }
}

export function crc64(buf: ArrayBuffer | null): string {
  if (!buf) return '0';
  initTable();

  const bytes = Uint8Array.wrap(buf);
  const len = bytes.length;

  let crc: u64 = ~<u64>0; // start with all 1s like the C implementation

  for (let i = 0; i < len; i++) {
    const b = <u64>bytes[i];
    const idx = <u32>((crc ^ b) & 0xff);
    crc = _table[idx] ^ (crc >> 8);
  }

  crc = ~crc;
  return crc.toString();
}
