/**
 * Global configuration for the crc64 utilities.
 *
 * `verbose` controls whether diagnostic and progress messages are emitted
 * by runtime helpers. It's a simple module-level flag that other modules
 * import and check to decide whether to print extra information.
 *
 * Default: `false` (quiet).
 */
export let verbose = false;

/**
 * Toggle verbose logging for the running process.
 *
 * This updates the module-level `verbose` flag. Consumers of this module
 * should read `verbose` (or call `setVerbose`) before emitting any
 * optional diagnostic output. Calling this function has no return value;
 * it simply sets the shared flag.
 *
 * Example:
 * ```ts
 * import { setVerbose, verbose } from "./config";
 * setVerbose(true);
 * if (verbose) console.log("extra debug");
 * ```
 *
 * @param v - When true, enables verbose logging; when false, disables it.
 */
export function setVerbose(v: boolean) {
  verbose = v;
}
