---
name: bearbnb-docs-regenerator
description: Regenerate the Psychic Guides BearBnB tutorial MDX files from a BearBnB git commit history. Use when the user says BearBnB has been rebuilt, fixed, replayed, or updated and wants docs/tutorials/bearbnb regenerated.
---

# BearBnB Docs Regenerator

Use this skill in the `psychic-guides` repo to regenerate `docs/tutorials/bearbnb/NN-*.mdx` from the commit history of a BearBnB project.

## Required Input

Ask for the BearBnB project root path if the user has not provided it. Do not assume a path. The path must be the root of the BearBnB git repo whose commits should become tutorial pages.

Example prompt:

> What is the path to the BearBnB project root to generate docs from?

## Workflow

1. Confirm you are in the `psychic-guides` repo.
2. Create a new branch before changing files, unless the user explicitly says a branch already exists.
3. Ensure the BearBnB root path exists and is a git repo.
4. Run the bundled script. Use the skill directory for the current agent:

   ```bash
   # Codex
   pnpm exec tsx .codex/skills/bearbnb-docs-regenerator/scripts/regenerate-bearbnb-docs.ts --bearbnb-root <path>

   # Claude
   pnpm exec tsx .claude/skills/bearbnb-docs-regenerator/scripts/regenerate-bearbnb-docs.ts --bearbnb-root <path>
   ```

   The script:
   - skips the first two BearBnB commits (`psychic init` and repository docs/setup)
   - deletes only `docs/tutorials/bearbnb/[0-9][0-9]-*.mdx`
   - preserves `docs/tutorials/bearbnb/README.mdx` and `docs/tutorials/bearbnb/overview.mdx`
   - writes one MDX file per remaining commit with frontmatter, commit message, and `git show` diff

5. Run maintenance scripts from the `psychic-guides` root:

   ```bash
   pnpm add-bearbnb-ids
   pnpm combine-docs
   pnpm fix-pagination
   ```

6. Keep the final diff scoped. The maintenance scripts may create or modify unrelated files:
   - `combined-docs.md` is an aggregate artifact; remove it if it is untracked and not requested.
   - `fix-pagination` may alter non-BearBnB docs. Revert unrelated changes unless the user asked to keep them.

7. Verify:

   ```bash
   pnpm build
   git status --short
   git diff --name-only
   ```

The expected final diff is the numbered BearBnB tutorial files plus this skill if you are creating/updating it. `README.mdx` and `overview.mdx` should be unchanged unless explicitly requested.

## Notes

- Do not push.
- Do not edit the BearBnB repo.
- The branch name should be descriptive, for example `update-bearbnb-tutorial-from-current-history`.
- If the generated count is not the expected number of tutorial commits, stop and inspect BearBnB history before replacing docs.
