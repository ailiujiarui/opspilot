import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export type ProjectRow = { id: number; version: number; task: string; owner: string; status: string; priority: number; due: string; budget: number };
export type ProjectColumn = 'task' | 'owner' | 'status' | 'priority' | 'due' | 'budget';
const projectColumns = new Set<ProjectColumn>(['task', 'owner', 'status', 'priority', 'due', 'budget']);
const owners = ['陈梅', '诺亚', '艾娃', '李欧', '苏菲亚'];
const statuses = ['Active', 'Review', 'Blocked', 'Done'];
const tasks = ['更新入职流程', '整理企业反馈', '准备季度预测', '审查设计系统', '解决接口延迟', '更新帮助中心'];
const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.GRIDFLOW_DB_PATH ?? './data/gridflow.sqlite');
if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true });
export const database = new DatabaseSync(dbPath);
database.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    version INTEGER NOT NULL,
    task TEXT NOT NULL,
    owner TEXT NOT NULL,
    status TEXT NOT NULL,
    priority INTEGER NOT NULL,
    due TEXT NOT NULL,
    budget REAL NOT NULL
  )
`);
const count = Number(database.prepare('SELECT COUNT(*) AS count FROM projects').get()?.count ?? 0);
if (count === 0) {
  const insert = database.prepare('INSERT INTO projects (id, version, task, owner, status, priority, due, budget) VALUES (?, 1, ?, ?, ?, ?, ?, ?)');
  database.exec('BEGIN');
  try { for (let i = 0; i < 100000; i++) insert.run(i + 1, `${tasks[i % tasks.length]} ${String(i + 1).padStart(5, '0')}`, owners[(i * 7) % owners.length], statuses[(i * 3) % statuses.length], (i % 4) + 1, `2026-${String((i % 6) + 7).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`, 1200 + ((i * 137) % 68000)); database.exec('COMMIT'); } catch (error) { database.exec('ROLLBACK'); throw error; }
}
database.exec('CREATE INDEX IF NOT EXISTS idx_projects_status_due ON projects(status, due, id); CREATE INDEX IF NOT EXISTS idx_projects_budget ON projects(budget, id); CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner, id);');
database.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(1);

export function queryProjects(input: { keyword?: string; status?: string; limit: number; offset: number; sort: 'due' | 'budget' | 'priority' | 'task'; direction: 'asc' | 'desc' }) {
  const conditions: string[] = []; const values: (string | number)[] = [];
  if (input.status) { conditions.push('status = ?'); values.push(input.status); }
  if (input.keyword) { conditions.push('(task LIKE ? OR owner LIKE ?)'); values.push(`%${input.keyword}%`, `%${input.keyword}%`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = `${input.sort} ${input.direction.toUpperCase()}, id ${input.direction.toUpperCase()}`;
  const total = Number(database.prepare(`SELECT COUNT(*) AS count FROM projects ${where}`).get(...values)?.count ?? 0);
  const rows = database.prepare(`SELECT id, version, task, owner, status, priority, due, budget FROM projects ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...values, input.limit, input.offset) as unknown as ProjectRow[];
  return { total, rows };
}

export function updateCell(id: number, column: ProjectColumn, value: string | number, version: number) {
  if (!projectColumns.has(column)) throw new Error(`Unsupported project column: ${column}`);
  const result = database.prepare(`UPDATE projects SET ${column} = ?, version = version + 1 WHERE id = ? AND version = ?`).run(value, id, version);
  if (!result.changes) return null;
  return getProject(id);
}

export function getProject(id: number) {
  return database.prepare('SELECT id, version, task, owner, status, priority, due, budget FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
}
