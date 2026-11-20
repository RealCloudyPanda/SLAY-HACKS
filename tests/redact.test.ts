import { describe, expect, it } from "vitest";
import { redact } from "@/domain/redact";

describe("redact", () => {
  it("removes emails", () => expect(redact("mail me at sam.lee@example.edu please")).toBe("mail me at [email] please"));
  it("removes 9-digit numbers", () => expect(redact("student 123456789 here")).toBe("student [number] here"));
  it("removes 'my name is Sam'", () => expect(redact("my name is Sam and I'm lost")).toBe("my name is [name] and I'm lost"));
  it.each(["Élodie Anne O’Neill", "SAM", "Anne-Marie Smith"])("redacts explicit name %s while preserving the report", (name) => {
    expect(redact(`My name is ${name} and I got stuck at the goal test`)).toBe(
      "My name is [name] and I got stuck at the goal test",
    );
  });
  it("keeps normal text and small numbers", () => expect(redact("f=9 at node G")).toBe("f=9 at node G"));
});
