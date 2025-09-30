/**
 * Append ts-self-types directive to the top of the built file.
 * {@link https://jsr.io/docs/about-slow-types#javascript-entrypoints docs}
 */
async function main(): Promise<void> {
  const path = import.meta.resolve("../build/release.js");
  console.log(`Append ts-self-types to ${path}`);
  const url = new URL(path);
  const prev = await Deno.readTextFile(url);
  await Deno.writeTextFile(url, `/* @ts-self-types="./release.d.ts" */
` + prev);
}

if (import.meta.main) {
  await main();
}
