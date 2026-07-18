import { describe, expect, it } from "vitest";
import { clampPoint, movePoint } from "./selection";

describe("grid focus movement", () => {
  it("clamps focus at the table edges", () => expect(movePoint({ row: 0, column: 0 }, { row: -1, column: -1 }, 10, 6)).toEqual({ row: 0, column: 0 }));
  it("moves focus within bounds", () => expect(movePoint({ row: 2, column: 2 }, { row: 1, column: -1 }, 10, 6)).toEqual({ row: 3, column: 1 }));
  it("clamps an arbitrary point", () => expect(clampPoint({ row: 99, column: 99 }, 2, 3)).toEqual({ row: 1, column: 2 }));
});
