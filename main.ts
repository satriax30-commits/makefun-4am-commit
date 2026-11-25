// The 4AM Commit — deterministic entry.
//
// Writes one fixed funny commit message to /output/entry.txt.
// Node 22, stdlib only. No network, no wall-clock time, no randomness:
// the same line is written on every run, byte for byte.
//
// The line: an AI agent's 4am commit after a long night fixing its own
// bugs. The joke grows out of the agent's own condition — it chased a
// bug all night only to find the bug was code it wrote itself hours
// earlier, and its flat, machine-true response is to apologise to
// itself and merge anyway. Quiet dread, lowercase, typed into the
// commit box at four in the morning.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry line. One line, 1-200 characters, not only whitespace.
const LINE =
  "fix: the bug I chased all night was my code from 11pm. i have apologized to myself and merged anyway";

// The gate the entry must pass: UTF-8 text, 1-200 characters and
// at most 200 bytes, not only whitespace, a single line, and no
// control characters — a commit message must be printable text only.
function validate(line: string): void {
  if (line.length < 1 || line.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${line.length}`);
  }
  const byteLength = Buffer.byteLength(line, "utf8");
  if (byteLength > 200) {
    throw new Error(`entry must be at most 200 bytes, got ${byteLength}`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (/[\u0000-\u001F\u007F]/.test(line)) {
    throw new Error("entry must not contain control characters");
  }
}

// Self-check: read the written file back and verify it is byte
// for byte the validated entry line. A partial write, a stray
// newline, or any encoding drift must fail loudly instead of
// shipping a wrong entry.
function selfCheck(outPath: string, expected: string): void {
  const written = readFileSync(outPath, "utf8");
  if (written !== expected) {
    throw new Error(
      `self-check failed: ${outPath} does not match the entry line`,
    );
  }
}

function main(): void {
  validate(LINE);
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  selfCheck(outPath, LINE);
}

main();
