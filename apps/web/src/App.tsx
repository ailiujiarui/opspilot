import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { Bot, Database, GitBranch, LayoutDashboard, ScrollText } from 'lucide-react'
import DataWorkspace from './DataWorkspace'
import AutomationWorkspace from './AutomationWorkspace'
import './Shell.css'

function Dashboard() {
  return <main className="dashboard-page">
    <section className="dashboard-heading"><p>企业运营智能工作台</p><h1>早上好，陈梅</h1><span>今天有 8 个项目需要关注，2 个自动化任务执行失败。</span></section>
    <section className="dashboard-grid">
      <div className="agent-card"><div className="agent-card-title"><Bot size={18}/><strong>企效助手</strong><span>只读分析</span></div><h2>需要我帮你处理什么？</h2><div className="dashboard-prompt">找出本周逾期且预算超过 5 万的项目<button>分析</button></div><div className="suggestions"><button>查看逾期项目</button><button>总结本周风险</button><button>检查失败流程</button></div></div>
      <div className="attention-panel"><h2>需要关注</h2><div><strong>8</strong><span>逾期项目</span></div><div><strong>2</strong><span>失败运行</span></div><div><strong>4</strong><span>待审核变更</span></div></div>
      <div className="activity-panel"><h2>最近活动</h2><p><i/>逾期项目提醒 <span>8/8 成功 · 10 分钟前</span></p><p><i className="warn"/>客户数据同步 <span>2 条失败 · 1 小时前</span></p><p><i/>项目状态批量更新 <span>12 条完成 · 昨天</span></p></div>
    </section>
  </main>
}

function App() {
  return <BrowserRouter><div className="product-shell"><aside className="shell-nav"><div className="shell-brand"><span><Bot size={17}/></span><strong>企效智控</strong></div><nav><NavLink to="/"><LayoutDashboard/>工作台</NavLink><NavLink to="/data"><Database/>数据</NavLink><NavLink to="/automation"><GitBranch/>自动化</NavLink><NavLink to="/audit"><ScrollText/>审计</NavLink></nav><div className="shell-user">MC</div></aside><div className="shell-content"><Routes><Route path="/" element={<Dashboard/>}/><Route path="/data" element={<DataWorkspace/>}/><Route path="/automation" element={<AutomationWorkspace/>}/><Route path="/audit" element={<div className="placeholder-page"><ScrollText size={28}/><h1>审计中心</h1><p>执行记录、数据变更和失败重试将在这里统一展示。</p></div>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></div></div></BrowserRouter>
}

export default App
