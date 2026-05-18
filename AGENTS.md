# AGENTS.md instructions for /Users/dwn/work/psychic-guides

## BearBnB tutorial regeneration

When the user says BearBnB has been rebuilt, fixed, replayed, updated, or asks to regenerate the BearBnB tutorial docs, use the project-local skill:

- Codex: `.codex/skills/bearbnb-docs-regenerator/SKILL.md`
- Other agents without native Codex skills: read that `SKILL.md` and follow it as prescribed instructions.

The workflow asks for the BearBnB project root path if the user did not provide it, creates a branch first, regenerates only `docs/tutorials/bearbnb/[0-9][0-9]-*.mdx`, preserves `README.mdx` and `overview.mdx`, runs the docs maintenance scripts, and verifies with `pnpm build`.

Do not overlook this skill; it replaces the old ad hoc script that lived outside this repo.
