# GridFlow 后端：Node.js 与 Fastify

## 技术关系

```text
Node.js：后端运行环境
Fastify：HTTP 服务框架
TypeScript：开发语言和编译期类型检查
Zod：请求参数运行时校验
SQLite：目标持久化数据库
```

Fastify 负责路由、请求生命周期、结构化日志和错误响应；Node.js 负责运行服务端程序。它们不是两种后端语言。

## 当前 API

```text
GET   /health
GET   /api/projects
PATCH /api/projects/:id/cells/:column
```

`GET /api/projects` 在服务端执行关键词、状态、排序和游标分页，浏览器只接收当前页面数据。`PATCH` 请求携带行版本号，版本不一致返回 `409 VERSION_CONFLICT`，字段值不合法返回 `422 VALIDATION_ERROR`。

## 选择 Fastify 的原因

- 轻量，适合个人项目的服务端 API。
- TypeScript 类型边界清晰，便于与 Zod 配合。
- Pino 结构化日志可记录 requestId、状态码和响应耗时。
- 插件体系足以承载 CORS、数据库、错误处理和未来的迁移边界。
- 不引入 NestJS 的模块和依赖注入样板代码。

Express 同样可以完成这个项目；真正有价值的是服务端分页、参数校验、版本冲突、错误恢复和测试，而不是框架名称本身。

## 运行和测试

```bash
npm --prefix apps/api install
npm --prefix apps/api run dev
npm --prefix apps/api test
npm --prefix apps/api run build
```

当前演示数据仍在 Node.js 内存中生成，SQLite 迁移和 Seed 属于下一阶段；不把内存数据描述成生产数据库。
