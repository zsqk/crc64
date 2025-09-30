import { __liftString } from "./main.ts";

export function abort(
  message: number,
  fileName: number,
  lineNumber: number,
  columnNumber: number,
): void {
  // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
  const messageStr = __liftString(message >>> 0);
  const fileNameStr = __liftString(fileName >>> 0);
  const lineNum = lineNumber >>> 0;
  const columnNum = columnNumber >>> 0;
  (() => {
    // @external.js
    throw Error(
      `${messageStr} in ${fileNameStr}:${lineNum}:${columnNum}`,
    );
  })();
}
