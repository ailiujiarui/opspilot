# GridFlow 后端：Node.js 与 Fastify

## 技术边界

```text
Node.js 24：服务运行时，提供 node:sqlite
Fastify：HTTP 路由、请求生命周期和结构化日志
TypeScript：编译期类型检查
Zod：请求参数和单元格值校验
SQLite：本地持久化、索引和确定性 Seed 数据
```

Fastify 只负责 HTTP 边界，数据库查询和更新集中在 `apps/api/src/db.ts`。这样可以独立测试查询、版本校验和 API 响应，不把数据逻辑塞进路由处理器。

## API

```text
GET   /health
GET   /api/projects
PATCH /api/projects/:id/cells/:column
```

`GET /api/projects` 参数：

```text
keyword       在 task 和 owner 中搜索
status        Active / Review / Blocked / Done
limit         1-200，默认 100
cursor        base64url 编码的 offset
sort          due / budget / priority / task 与 asc / desc
```

服务端执行筛选、排序和分页，浏览器只接收当前窗口的数据。排序始终追加 `id` 作为稳定次序，避免相同值在翻页时重复或丢失。

`PATCH` 必须携带当前 `version`。更新使用 `WHERE id = ? AND version = ?` 的乐观并发条件：

- 成功返回更新后的行和新版本；
- 行不存在返回 `404 ROW_NOT_FOUND`；
- 版本过期返回 `409 VERSION_CONFLICT` 和当前行；
- 状态、优先级、预算不符合约束返回 `422 VALIDATION_ERROR`。

## SQLite 初始化、迁移和 Seed

API 首次启动时会：

1. 创建 `data/` 目录和 SQLite 文件；
2. 创建 `schema_migrations` 与 `projects` 表；
3. 建立状态、预算、负责人和日期相关索引；
4. 当项目表为空时写入 100,000 条确定性 Seed 数据。

默认路径是 `./data/gridflow.sqlite`，可用 `GRIDFLOW_DB_PATH` 覆盖。测试环境自动使用 `:memory:`，不会污染本地数据库。

```powershell
$env:GRIDFLOW_DB_PATH = './data/gridflow.sqlite'
npm --prefix apps/api run dev
```

当前迁移版本记录在 `schema_migrations`。后续表结构变化应新增版本并保持旧数据可迁移；不要在业务路由中直接修改表结构。需要重建演示数据时，停止 API 后删除 `data/gridflow.sqlite`，再重新启动即可。

## 为什么选 Fastify

- 路由和插件边界清晰，适合小型 Node.js 服务；
- 原生 TypeScript 体验与 Zod 校验容易组合；
- Pino 结构化日志会记录 requestId、状态码和耗时；
- CORS、错误处理和数据库连接可以按插件拆分；
- 相比引入完整框架，依赖和运行时成本更低。

Express 也能实现相同 API，但本项目的重点是数据分页、版本冲突和可测试性，框架本身不是卖点。

## 本地验证

```powershell
npm --prefix apps/api install
npm --prefix apps/api run dev
npm --prefix apps/api test
npm --prefix apps/api run build
```

Node.js 需要 24.x，因为 `node:sqlite` 是当前后端的运行时依赖。
