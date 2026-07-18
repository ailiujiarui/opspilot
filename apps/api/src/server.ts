import Fastify from 'fastify'
import cors from '@fastify/cors'
import { z } from 'zod'
import { getProject, queryProjects, updateCell } from './db.js'

const app = Fastify({ logger: true, genReqId: () => crypto.randomUUID() })
await app.register(cors, { origin: true })

app.get('/health', async () => ({ ok: true }))

app.get('/api/projects', async request => {
  const query = z.object({
    keyword: z.string().optional(),
    status: z.string().optional(),
    limit: z.coerce.number().min(1).max(200).default(100),
    cursor: z.string().optional(),
    sort: z.string().regex(/^(due|budget|priority|task):(asc|desc)$/).default('due:asc'),
  }).parse(request.query)
  const decodedOffset = query.cursor ? Number(Buffer.from(query.cursor, 'base64url').toString()) : 0
  const offset = Number.isInteger(decodedOffset) && decodedOffset >= 0 ? decodedOffset : 0
  const [field, direction] = query.sort.split(':') as ['due' | 'budget' | 'priority' | 'task', 'asc' | 'desc']
  const result = queryProjects({ keyword: query.keyword, status: query.status, limit: query.limit, offset, sort: field, direction })
  return {
    total: result.total,
    rows: result.rows,
    nextCursor: offset + result.rows.length < result.total ? Buffer.from(String(offset + result.rows.length)).toString('base64url') : null,
  }
})

app.patch('/api/projects/:id/cells/:column', async (request, reply) => {
  const params = z.object({ id: z.coerce.number().int().positive(), column: z.enum(['task', 'owner', 'status', 'priority', 'due', 'budget']) }).parse(request.params)
  const body = z.object({ value: z.union([z.string(), z.number()]), version: z.number().int().positive() }).parse(request.body)
  const next: string | number = params.column === 'priority' || params.column === 'budget' ? Number(body.value) : String(body.value)
  const numericNext = typeof next === 'number' ? next : Number(next)
  if ((params.column === 'priority' && (!Number.isInteger(numericNext) || numericNext < 1 || numericNext > 4)) || (params.column === 'budget' && (!Number.isFinite(numericNext) || numericNext < 0)) || (params.column === 'status' && !['Active', 'Review', 'Blocked', 'Done'].includes(String(next)))) {
    return reply.code(422).send({ code: 'VALIDATION_ERROR', message: '字段值不符合类型约束', requestId: request.id })
  }
  const row = updateCell(params.id, params.column, next, body.version)
  if (row) return { row, requestId: request.id }

  const current = getProject(params.id)
  if (!current) return reply.code(404).send({ code: 'ROW_NOT_FOUND', message: '项目不存在', requestId: request.id })
  return reply.code(409).send({ code: 'VERSION_CONFLICT', message: '项目已被其他操作更新', requestId: request.id, row: current })
})

if (process.env.NODE_ENV !== 'test') await app.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' })
export default app
