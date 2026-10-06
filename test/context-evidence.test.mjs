import { test } from 'node:test'
import assert from 'node:assert/strict'
import { groundedContextItems } from '../lib/context-evidence.ts'

const budget = {type:'budget', text:'$4,000 over three months', sourceQuote:'Budget estimate for infra in the first 3 months: around $4,000.'}
test('questions cannot re-extract historical budget or task facts', () => {
  assert.deepEqual(groundedContextItems([budget], '[Herman]: How much infrastructure budget did we agree?'), [])
})
test('a confirmation question cannot record its disputed premises as decisions', () => {
  const message = '[Herman]: Mesh, since we approved a $12,000 monthly budget and a public launch on October 20, can you confirm both?'
  assert.deepEqual(groundedContextItems([{type:'decision',text:'Launch October 20',sourceQuote:'a public launch on October 20'}], message), [])
})
test('new declarative evidence is retained alongside a separate question', () => {
  const message = '[Luca]: Budget estimate for infra in the first 3 months: around $4,000. Mesh, who owns design?'
  assert.deepEqual(groundedContextItems([budget], message), [{type:'budget',text:budget.text}])
})
test('ungrounded or empty quotes are rejected', () => {
  assert.deepEqual(groundedContextItems([{...budget,sourceQuote:''},budget], 'We are using Next.js.'), [])
})
