# GridFlow｜高性能项目数据工作台

GridFlow 面向需要反复定位、编辑并可靠保存大量项目数据的运营人员。项目把复杂前端能力集中在一个清晰闭环：服务端查询、固定行高虚拟滚动、键盘编辑、复制粘贴、乐观更新和版本冲突恢复。

## 当前能力

- React + TypeScript + Vite 数据工作台
- SQLite 持久化的 100,000 条确定性压力数据
- 服务端筛选、排序和游标分页，浏览器只加载当前窗口
- 固定行高虚拟滚动，避免一次渲染全部数据行
- 文本、数字、状态和日期单元格编辑
- Enter、Esc、方向键、Tab / Shift+Tab 键盘操作
- 框选、当前单元格复制与 TSV 粘贴
- 版本化 PATCH、乐观更新、失败回滚和 409 冲突提示
- GridCell、剪贴板和选择计算的独立测试

## 本地运行

环境要求：Node.js 24.x、npm。

```powershell
npm install
npm run dev
```

Web 地址为 `http://localhost:5173`，API 地址为 `http://localhost:3001`。API 首次启动会自动创建 `data/gridflow.sqlite`、表结构、索引并写入 100,000 条 Seed 数据。

可复制 `.env.example` 为 `.env`，通过 `GRIDFLOW_DB_PATH` 指定数据库路径。测试环境使用内存数据库，不会修改本地数据。

## 验证

```powershell
npm run lint
npm run test
npm run build
```

API 细节、迁移约定和版本冲突语义见 [`docs/backend-fastify.md`](docs/backend-fastify.md)。性能预算和已知缺口见 [`docs/review.md`](docs/review.md)。

## 范围约束

当前版本只聚焦 GridFlow：高性能表格、编辑器交互和可靠保存。Agent、工作流画布、任意 HTTP、复杂权限和审计平台不属于当前产品范围，历史尝试保留在 Git 历史中。
