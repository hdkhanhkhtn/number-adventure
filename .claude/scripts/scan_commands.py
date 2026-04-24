#!/usr/bin/env python3
"""
Command scanner for .claude/commands/ directory.

Scans command routers and their variant files, outputs metadata.
Commands are now in .claude/commands/ with variant routing (fast/hard/focus/team).
"""

from pathlib import Path
try:
    import yaml
except ModuleNotFoundError:
    raise SystemExit(
        "PyYAML is required. Install with: python3 -m pip install -r .claude/scripts/requirements.txt"
    )
import re


def extract_frontmatter(content: str) -> dict:
    """Extract YAML frontmatter from markdown content."""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        try:
            return yaml.safe_load(match.group(1))
        except Exception:
            return {}
    return {}


def scan_commands(commands_dir: Path) -> list:
    """Scan .claude/commands/ for router files and their variants."""
    commands = []

    for router_file in sorted(commands_dir.glob("*.md")):
        cmd_name = router_file.stem
        content = router_file.read_text(encoding="utf-8")
        fm = extract_frontmatter(content)

        # Find variant files
        variant_dir = commands_dir / cmd_name
        variants = []
        if variant_dir.is_dir():
            for v_file in sorted(variant_dir.glob("*.md")):
                v_content = v_file.read_text(encoding="utf-8")
                v_fm = extract_frontmatter(v_content)
                variants.append({
                    "name": v_file.stem,
                    "description": v_fm.get("description", ""),
                })

        commands.append({
            "name": cmd_name,
            "description": fm.get("description", ""),
            "category": fm.get("category", "general"),
            "variants": variants,
        })

    return commands


def main() -> None:
    commands_dir = Path(".claude/commands")
    output_path = Path(".claude/scripts/commands_data.yaml")

    if not commands_dir.exists():
        output_path.write_text("# No commands directory found.\n[]\n", encoding="utf-8")
        print("No .claude/commands/ directory found.")
        return

    commands = scan_commands(commands_dir)

    with open(output_path, "w", encoding="utf-8") as f:
        yaml.dump(commands, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

    print(f"Scanned {len(commands)} commands with variants.")
    print(f"Saved metadata to {output_path}")


if __name__ == "__main__":
    main()
