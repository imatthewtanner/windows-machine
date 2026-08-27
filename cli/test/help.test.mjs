import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("help exposes composable command surface", () => {
  const result = spawnSync(process.execPath, ["bin/campaign-studio.mjs", "help"], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /validate --file/);
  assert.match(result.stdout, /generate --file/);
  assert.match(result.stdout, /--json/);
});

test("invalid command uses nonzero exit and stderr", () => {
  const result = spawnSync(process.execPath, ["bin/campaign-studio.mjs", "nope"], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Unknown command/);
});

