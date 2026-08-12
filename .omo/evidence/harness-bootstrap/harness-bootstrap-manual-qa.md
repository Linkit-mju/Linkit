# Manual QA — shared agent harness bootstrap

## checks

| check | expected behavior | verdict |
|---|---|---|
| Codex entrypoint | Root `AGENTS.md` instructs the agent to read `.omo/HARNESS.md` before work | PASS |
| Claude entrypoint | Root `CLAUDE.md` instructs Claude to read `AGENTS.md` and `.omo/HARNESS.md` | PASS |
| State index | `.omo/HARNESS.md` links the existing and bootstrap evidence files | PASS |
| Repository paths | All referenced files exist at the stated relative paths | PASS |
| Markdown integrity | `git diff --check` exits successfully | PASS |

## verdict

VERDICT: PASS
CONFIDENCE: HIGH

EVIDENCE TRACE: Required entrypoint, state, and evidence files were present. The relative evidence link resolved to an existing file, and `git diff --check` reported no whitespace errors.
