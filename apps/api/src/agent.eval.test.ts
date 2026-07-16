import { describe, expect, it } from 'vitest'
import { parseIntent } from './agent.js'

const cases = [
  { input: '找出预算超过 5 万的项目', field: 'budget', operator: 'gt', value: 50000 },
  { input: '查找预算低于 3 万的项目', field: 'budget', operator: 'lt', value: 30000 },
  { input: '查看进行中的项目', field: 'status', operator: 'eq', value: 'Active' },
  { input: '负责人是陈梅的项目', field: 'owner', operator: 'eq', value: '陈梅' },
] as const

describe('Agent 固定评测集', () => {
  for (const item of cases) it(item.input, () => expect(parseIntent(item.input).filters).toContainEqual({ field: item.field, operator: item.operator, value: item.value }))
  it('只读查询永远不要求写确认', () => expect(parseIntent('查看项目').requiresConfirmation).toBe(false))
})
