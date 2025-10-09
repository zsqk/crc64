import { register } from './temp_lib.ts';
import { assert, assertEquals } from "@std/assert";

// Provide a stub implementation for the global ww object expected by temp_lib.ts
// The real environment would call the success callbacks asynchronously after signature validation.
interface WWRegisterOptions {
  corpId: string;
  agentId?: string | number;
  suiteId?: string;
  jsApiList?: string[];
  openTagList?: string[];
  getConfigSignature?: (url: string) => Promise<unknown> | unknown;
  getAgentConfigSignature?: (url: string) => Promise<unknown> | unknown;
  onConfigSuccess?: (res: { checkResult: unknown; errMsg: string; errCode: number }) => void;
  onConfigFail?: (res: { errMsg: string; errCode: number }) => void;
  onAgentConfigSuccess?: (res: { checkResult: unknown; errMsg: string; errCode: number }) => void;
  onAgentConfigFail?: (res: { errMsg: string; errCode: number }) => void;
}

interface WWGlobal {
  register(opts: WWRegisterOptions): void;
}

(globalThis as unknown as { ww: WWGlobal }).ww = {
  register(opts: WWRegisterOptions) {
    // Simulate async behavior
    setTimeout(async () => {
      try {
        if (opts.getConfigSignature) {
          await opts.getConfigSignature('https://example.com/config');
          opts.onConfigSuccess?.({ checkResult: {}, errMsg: 'ok', errCode: 0 });
        }
        if (opts.getAgentConfigSignature) {
          await opts.getAgentConfigSignature('https://example.com/agent');
          opts.onAgentConfigSuccess?.({ checkResult: {}, errMsg: 'ok', errCode: 0 });
        }
      } catch (e) {
        opts.onConfigFail?.({ errMsg: String(e), errCode: -1 });
        opts.onAgentConfigFail?.({ errMsg: String(e), errCode: -1 });
      }
    }, 0);
  },
};

Deno.test('temp_lib register success', async () => {
  const { config, agentConfig } = await register({
    corpId: 'ding1234567890abcdefg',
    agentId: 123456789,
    jsApiList: ['runtime.info', 'device.notification.alert'],
    getConfigSignature: (_url) => ({
      timestamp: Date.now(),
      nonceStr: 'nonceStr',
      signature: 'signature',
    }),
    getAgentConfigSignature: (_url) => ({
      timestamp: Date.now(),
      nonceStr: 'nonceStr',
      signature: 'signature',
    }),
  });
  assert(config && 'checkResult' in config, 'config should have checkResult');
  assert(agentConfig && 'checkResult' in agentConfig, 'agentConfig should have checkResult');
  assertEquals(config.errCode, 0);
  assertEquals(agentConfig.errCode, 0);
});