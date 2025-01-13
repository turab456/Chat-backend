import { sum } from "../src/sum.js";

describe("sum function", () => {
  it("adds two numbers correctly", () => {
    expect(sum(1, 2)).toBe(3);
  });
});