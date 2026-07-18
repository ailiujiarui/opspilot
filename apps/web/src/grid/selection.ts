export type GridPoint = { row: number; column: number };

export function clampPoint(point: GridPoint, rowCount: number, columnCount: number): GridPoint {
  return {
    row: Math.min(Math.max(point.row, 0), Math.max(rowCount - 1, 0)),
    column: Math.min(Math.max(point.column, 0), Math.max(columnCount - 1, 0)),
  };
}

export function movePoint(point: GridPoint, delta: GridPoint, rowCount: number, columnCount: number): GridPoint {
  return clampPoint({ row: point.row + delta.row, column: point.column + delta.column }, rowCount, columnCount);
}
