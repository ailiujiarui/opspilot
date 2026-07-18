import { afterAll, describe, expect, it } from 'vitest'
import app from './server.js'

afterAll(() => app.close())
describe('GridFlow API', () => {
  it('返回健康状态', async () => expect((await app.inject({ method: 'GET', url: '/health' })).json()).toEqual({ ok: true }))
  it('服务端执行筛选、排序和游标分页', async () => {
    const first = await app.inject({ method: 'GET', url: '/api/projects?status=Active&sort=budget:desc&limit=3' })
    const body = first.json()
    expect(body.rows).toHaveLength(3)
    expect(body.nextCursor).toBeTruthy()
    expect(body.rows[0].budget).toBeGreaterThanOrEqual(body.rows[1].budget)
    const second = await app.inject({ method: 'GET', url: `/api/projects?status=Active&sort=budget:desc&limit=3&cursor=${body.nextCursor}` })
    expect(second.json().rows[0].id).not.toBe(body.rows[0].id)
  })
  it('保存单元格并拒绝过期版本', async () => {
    const row = (await app.inject({ method: 'GET', url: '/api/projects?limit=1' })).json().rows[0]
    const saved = await app.inject({ method: 'PATCH', url: `/api/projects/${row.id}/cells/status`, payload: { value: 'Review', version: row.version } })
    expect(saved.statusCode).toBe(200)
    const conflict = await app.inject({ method: 'PATCH', url: `/api/projects/${row.id}/cells/status`, payload: { value: 'Done', version: row.version } })
    expect(conflict.statusCode).toBe(409)
  })
  it('对非首行记录返回正确版本冲突', async () => {
    const row = (await app.inject({ method: 'GET', url: '/api/projects?limit=1&sort=task:desc' })).json().rows[0]
    const saved = await app.inject({ method: 'PATCH', url: `/api/projects/${row.id}/cells/status`, payload: { value: 'Review', version: row.version } })
    expect(saved.statusCode).toBe(200)
    const conflict = await app.inject({ method: 'PATCH', url: `/api/projects/${row.id}/cells/status`, payload: { value: 'Done', version: row.version } })
    expect(conflict.statusCode).toBe(409)
    expect(conflict.json().row.id).toBe(row.id)
  })
})
