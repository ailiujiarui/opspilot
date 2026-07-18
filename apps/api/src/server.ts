import Fastify from 'fastify'
import cors from '@fastify/cors'
import { z } from 'zod'
import { projects } from './data.js'

const app = Fastify({ logger: true, genReqId: () => crypto.randomUUID() })
await app.register(cors, { origin: true })

app.get('/health', async () => ({ ok: true }))

app.get('/api/projects', async request => {
  const query = z.object({ keyword: z.string().optional(), status: z.string().optional(), limit: z.coerce.number().min(1).max(200).default(100), cursor: z.string().optional(), sort: z.string().regex(/^(due|budget|priority|task):(asc|desc)$/).default('due:asc') }).parse(request.query)
  const offset = query.cursor ? Number(Buffer.from(query.cursor, 'base64url').toString()) : 0
  const filtered = projects.filter(p => (!query.status || p.status === query.status) && (!query.keyword || `${p.task} ${p.owner}`.includes(query.keyword)))
  const [field, direction] = query.sort.split(':') as ['due' | 'budget' | 'priority' | 'task', 'asc' | 'desc']
  filtered.sort((a, b) => { const left = a[field]; const right = b[field]; const result = left < right ? -1 : left > right ? 1 : a.id - b.id; return direction === 'asc' ? result : -result })
  const rows = filtered.slice(offset, offset + query.limit)
  return { total: filtered.length, rows, nextCursor: offset + rows.length < filtered.length ? Buffer.from(String(offset + rows.length)).toString('base64url') : null }
})

app.patch('/api/projects/:id/cells/:column', async (request, reply) => {
  const params = z.object({ id: z.coerce.number().int().positive(), column: z.enum(['task', 'owner', 'status', 'priority', 'due', 'budget']) }).parse(request.params)
  const body = z.object({ value: z.union([z.string(), z.number()]), version: z.number().int().positive() }).parse(request.body)
  const row = projects[params.id - 1]
  if (!row) return reply.code(404).send({ code: 'ROW_NOT_FOUND', message: '项目不存在', requestId: request.id })
  if (row.version !== body.version) return reply.code(409).send({ code: 'VERSION_CONFLICT', message: '项目已被其他操作更新', requestId: request.id, row })
  const next = params.column === 'priority' || params.column === 'budget' ? Number(body.value) : body.value
  if ((params.column === 'priority' && (!Number.isInteger(Number(next)) || Number(next) < 1 || Number(next) > 4)) || (params.column === 'budget' && (!Number.isFinite(Number(next)) || Number(next) < 0)) || (params.column === 'status' && !['Active', 'Review', 'Blocked', 'Done'].includes(String(next)))) return reply.code(422).send({ code: 'VALIDATION_ERROR', message: '字段值不符合类型约束', requestId: request.id })
  row[params.column] = next as never
  row.version += 1
  return { row, requestId: request.id }
})

if (process.env.NODE_ENV !== 'test') await app.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' })
export default app
