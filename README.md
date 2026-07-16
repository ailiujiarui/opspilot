# 企效智控

企效智控是一个融合数据工作台、企业 Agent 和可视化自动化的运营管理产品。

## 模块

- `/`：统一工作台与企效助手入口
- `/data`：10 万条演示数据的虚拟化数据工作台
- `/automation`：节点式工作流编辑器
- `/audit`：审计与失败重试入口

## 本地运行

```bash
cd apps/web
npm install
npm run dev
```

验证命令：

```bash
npm run lint
npx tsc -b
npm run build
```

自动化模块由原 CanvasFlow 项目迁入。原仓库保留为归档，只读保存迁移前历史。

当前 Agent 为前端交互原型，只做只读分析预览，不直接修改业务数据，也不执行任意 HTTP 请求。
