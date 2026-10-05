import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createChatStream } from '../lib/chat-stream.ts';

async function* parts(values) { yield* values; }
async function events(stream) {
  return (await new Response(stream).text()).trim().split('\n\n').map(line => JSON.parse(line.slice(6)));
}
test('stream preserves context and text, then emits completion', async () => {
  const result = await events(createChatStream(parts([{type:'text-delta',textDelta:'hello'}]), [{type:'task',text:'Ship demo'}]));
  assert.equal(result[0].contextItems[0].text, 'Ship demo');
  assert.deepEqual(result.slice(1), [{type:'text',content:'hello'}, {type:'done'}]);
});
test('SDK error event is visible to the client and never reported as success', async () => {
  const result = await events(createChatStream(parts([{type:'text-delta',textDelta:'partial'}, {type:'error',error:new Error('fixture failure')}]), []));
  assert.equal(result.at(-1).type, 'error');
  assert.ok(!result.some(event => event.type === 'done'));
});
