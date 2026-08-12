# Repository agent harness

Before changing code:

1. Read `.omo/HARNESS.md`.
2. Read every evidence file listed in its `Evidence index` that is relevant to the current task.
3. Treat source code, tests, and fresh command output as the source of truth when they conflict with an MD file.

After each meaningful implementation or verification cycle:

1. Update `.omo/HARNESS.md` with the current goal, status, completed work, blockers, and next action.
2. Save durable verification evidence under `.omo/evidence/<task-slug>/` as a Markdown file.
3. Add or update that file in `.omo/HARNESS.md` under `Evidence index`.
4. Do not mark work complete without a recorded verification result.

Keep the state concise. Use repository-relative paths, ISO dates, and explicit `PASS`, `FAIL`, or `BLOCKED` verdicts.
