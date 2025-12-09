"""
NBTree extraction utility using nbtlib.

This script walks through NBT `.dat` files under a source directory (by default
`Backups/Season1/data/lootr`), converts them to plain data types, and writes
the results to the `Output/<filepath>.<ext>` path where `<filepath>` preserves the
original input file path relative to the project root. The output format can be
JSON (default) or YAML.

Usage:
  python statGatherer.py \
    --source Backups/Season1/data/lootr \
    --output Output

You can also hardcode frequently used source paths by editing the
`HARDCODED_SOURCES` array below and then running:
  python statGatherer.py --include-hardcoded
or with additional sources:
  python statGatherer.py --include-hardcoded --source Backups/Season1/advancements

Notes:
  - Requires `nbtlib` to be installed: `pip install nbtlib`.
  - Optional YAML output requires `PyYAML`: `pip install pyyaml`.
  - Output file extension is changed from `.dat` to `.json` or `.yaml` depending on `--format`.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable, Any, Literal
from collections.abc import Mapping, Iterable as IterABC

try:
    import nbtlib  # type: ignore
except Exception as e:  # pragma: no cover
    raise SystemExit(
        "nbtlib is required to run this script. Install it with 'pip install nbtlib'.\n"
        f"Import error: {e}"
    )


# ---------------------- Helper Functions ----------------------

# Edit this list to hardcode frequently used source paths (files or directories).
# Use absolute paths or paths relative to the project root. Examples:
# HARDCODED_SOURCES = [
#     "Backups/Season1/data/lootr",
#     "Backups/Season1/advancements",
# ]
HARDCODED_SOURCES: list[str] = ["Backups/Season1/data/lootr", "Backups/Season1/data/waystones.dat", "Backups/Season1/deaths", "Backups/Season1/playerdata", "Backups/Season1/stats", "Backups/Season1/level.dat", "Backups/Season1/advancements"]


def resolve_hardcoded_sources(project_root: Path) -> list[Path]:
    """Resolve `HARDCODED_SOURCES` into Path objects.

    Entries may be absolute or relative to the project root.
    Non-existing paths are still returned (they'll be skipped later).
    """
    resolved: list[Path] = []
    for s in HARDCODED_SOURCES:
        p = Path(s)
        if not p.is_absolute():
            p = project_root / p
        resolved.append(p)
    return resolved


def _dedupe_paths(paths: list[Path]) -> list[Path]:
    """Deduplicate while preserving order (by resolved absolute string)."""
    seen: set[str] = set()
    out: list[Path] = []
    for p in paths:
        try:
            key = str(p.resolve())
        except Exception:
            key = str(p)
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out

def find_dat_files(source_base: Path) -> Iterable[Path]:
    """Yield all `.dat` files under the given source directory (recursively)."""
    if not source_base.exists():
        return []
    return source_base.rglob("*.dat")


def iter_source_files(sources: Iterable[Path], exts: tuple[str, ...]) -> Iterable[Path]:
    """Yield files from one or more sources (files or directories) matching extensions.

    - `sources` may contain file paths or directories.
    - `exts` should be a tuple of extensions, e.g., (".dat",) or (".json", ".dat").
    """
    exts_lower = tuple(e.lower() for e in exts)
    for src in sources:
        try:
            if not src.exists():
                continue
            if src.is_dir():
                for ext in exts_lower:
                    yield from src.rglob(f"*{ext}")
            else:
                if src.suffix.lower() in exts_lower:
                    yield src
        except Exception:
            # Ignore problematic paths and continue
            continue


def load_nbt(file_path: Path) -> Any:
    """Load an NBT file and return its root payload.

    Supports both binary NBT and SNBT (text) files. Normalizes various
    nbtlib return shapes (e.g., objects with `.root`, `.tree`, or direct tags).
    """
    # 1) Try to detect and parse SNBT (text) first — many Lootr files are SNBT
    try:
        with file_path.open("rb") as fb:
            head = fb.read(64)
        stripped = head.lstrip()
        if stripped.startswith(b"{") or stripped.startswith(b"["):
            # Looks like textual SNBT
            with file_path.open("r", encoding="utf-8") as f:
                snbt_text = f.read()
            tag = nbtlib.parse(snbt_text)
            return tag
    except Exception:
        # Fall back to binary load if text parse path fails
        pass

    # 2) Fallback to binary NBT load using nbtlib.load
    file_obj = nbtlib.load(str(file_path))

    # 3) Normalize different nbtlib file shapes
    for attr in ("root", "tree", "data"):
        if hasattr(file_obj, attr):
            return getattr(file_obj, attr)

    # If it's already mapping-like, return as-is
    if hasattr(file_obj, "items"):
        return file_obj

    # If it has a value (nbt tag), unwrap
    if hasattr(file_obj, "value"):
        return getattr(file_obj, "value")

    return file_obj


def _to_plain(obj: Any) -> Any:
    """Recursively convert nbtlib tags to plain Python types safe for JSON.

    Strategy:
      - If the object is mapping-like (has `.items()`), convert keys/values.
      - If it's a sequence (list/tuple), convert each element.
      - If it has a `.value` attribute (common for nbt tags), unwrap it then recurse.
      - Otherwise, return the object as-is (numbers, strings, bools, None).
    """
    # Mapping-like (e.g., Compound behaves like a dict)
    if isinstance(obj, Mapping) or hasattr(obj, "items"):
        return {str(k): _to_plain(v) for k, v in obj.items()}

    # Sequence-like (Lists, Tuples, Sets): convert to list
    if isinstance(obj, (list, tuple, set)):
        return [_to_plain(x) for x in obj]

    # nbtlib tag types expose `.value` for the underlying payload
    if hasattr(obj, "value"):
        try:
            return _to_plain(getattr(obj, "value"))
        except Exception:
            pass

    # Some array-like values (e.g., array('i')) aren't lists; coerce to list if possible
    try:
        from array import array  # local import to avoid unused in environments without arrays

        if isinstance(obj, array):
            return list(obj)
    except Exception:
        pass

    # Some nbtlib array-like tags (e.g., IntArray, LongArray, ByteArray) may be iterable
    # but not recognized above; convert generic iterables (excluding str/bytes) to list
    if isinstance(obj, IterABC) and not isinstance(obj, (str, bytes, bytearray)):
        try:
            return [_to_plain(x) for x in obj]
        except Exception:
            # If it isn't safely iterable, fall through to primitive return
            pass

    # Primitive types (int, float, str, bool, None) are JSON-serializable
    return obj


def nbt_to_plain(nbt_root: Any) -> Any:
    """Public wrapper to convert an NBT root object to a JSON-serializable structure."""
    return _to_plain(nbt_root)


def compute_output_path(
    input_path: Path, project_root: Path, output_base: Path, out_ext: str
) -> Path:
    """Compute the output path preserving the input relative path and extension.

    Example:
      input:  <root>/Backups/Season1/data/lootr/some/folder/file.dat
      output: <root>/Output/Backups/Season1/data/lootr/some/folder/file.<ext>
    """
    rel = input_path.relative_to(project_root)
    if not out_ext.startswith("."):
        out_ext = "." + out_ext
    out = (output_base / rel).with_suffix(out_ext)
    return out


def ensure_parent_dir(file_path: Path) -> None:
    """Ensure the parent directory for file_path exists."""
    file_path.parent.mkdir(parents=True, exist_ok=True)


def write_json(data: Any, out_path: Path) -> None:
    """Write data as pretty-printed JSON to out_path using atomic replace."""
    ensure_parent_dir(out_path)
    tmp_path = out_path.with_suffix(out_path.suffix + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.flush()
    # Atomic replace to avoid partial files on failure
    tmp_path.replace(out_path)


def write_yaml(data: Any, out_path: Path) -> None:
    """Write data as YAML to out_path using atomic replace.

    Requires PyYAML (`pip install pyyaml`).
    """
    try:
        import yaml  # type: ignore
    except Exception as e:  # pragma: no cover
        raise RuntimeError(
            "YAML output requested but PyYAML is not installed. Install with 'pip install pyyaml'."
        ) from e

    ensure_parent_dir(out_path)
    tmp_path = out_path.with_suffix(out_path.suffix + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(
            data,
            f,
            allow_unicode=True,
            sort_keys=False,
            default_flow_style=False,
        )
        f.flush()
    tmp_path.replace(out_path)


def copy_file_atomic(src: Path, dst: Path) -> None:
    """Copy a file from `src` to `dst` using an atomic replace.

    Ensures the destination directory exists and avoids partial writes.
    """
    ensure_parent_dir(dst)
    tmp_path = dst.with_suffix(dst.suffix + ".tmp")
    # Copy in binary mode
    with src.open("rb") as f_in, tmp_path.open("wb") as f_out:
        for chunk in iter(lambda: f_in.read(1024 * 1024), b""):
            f_out.write(chunk)
            f_out.flush()
    tmp_path.replace(dst)


OutputFormat = Literal["json", "yaml"]


def process_all(
    sources: list[Path], output_base: Path, project_root: Path, fmt: OutputFormat
) -> int:
    """Process inputs from one or more sources.

    - Converts all `.dat` files found under the given sources to JSON/YAML.
    - Copies any existing `.json` files found under the sources to the output,
      preserving the file paths relative to `project_root`.

    Returns the total number of files written (converted + copied).
    """
    total = 0

    # 1) Convert .dat files
    for dat_path in iter_source_files(sources, (".dat",)):
        try:
            nbt_root = load_nbt(dat_path)
            plain = nbt_to_plain(nbt_root)
            if fmt == "json":
                out_path = compute_output_path(dat_path, project_root, output_base, ".json")
                write_json(plain, out_path)
            elif fmt == "yaml":
                out_path = compute_output_path(dat_path, project_root, output_base, ".yaml")
                write_yaml(plain, out_path)
            else:  # pragma: no cover
                raise ValueError(f"Unsupported format: {fmt}")
            total += 1
        except Exception as exc:  # pragma: no cover
            import sys

            print(f"Error processing {dat_path}: {exc}", file=sys.stderr)

    # 2) Copy existing .json files
    for json_path in iter_source_files(sources, (".json",)):
        try:
            out_path = compute_output_path(json_path, project_root, output_base, json_path.suffix)
            copy_file_atomic(json_path, out_path)
            total += 1
        except Exception as exc:  # pragma: no cover
            import sys

            print(f"Error copying {json_path}: {exc}", file=sys.stderr)

    return total


# ---------------------- CLI Entrypoint ----------------------

def main(argv: list[str] | None = None) -> int:
    project_root = Path(__file__).resolve().parent

    parser = argparse.ArgumentParser(description="Extract NBT .dat files to JSON using nbtlib.")
    parser.add_argument(
        "--source",
        type=Path,
        nargs="*",
        default=None,
        help=(
            "Zero or more source paths (files or directories). All .dat files will be converted; "
            "any existing .json files under these paths will be copied to Output while preserving paths. "
            "If omitted, you can rely on --include-hardcoded or fallback default."
        ),
    )
    parser.add_argument(
        "--include-hardcoded",
        action="store_true",
        help=(
            "Include paths listed in HARDCODED_SOURCES (edit inside the script). "
            "If --source is omitted, only hardcoded paths (or fallback) are used."
        ),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=project_root / "Output",
        help="Output base directory (default: Output at project root)",
    )
    parser.add_argument(
        "--format",
        choices=["json", "yaml"],
        default="json",
        help="Output format. 'json' (default) needs no extra deps; 'yaml' is human-friendly (requires PyYAML).",
    )
    args = parser.parse_args(argv)

    default_lootr = project_root / "Backups" / "Season1" / "data" / "lootr"
    sources: list[Path] = []
    if args.source:
        sources.extend(args.source)
    if args.include_hardcoded or not sources:
        sources.extend(resolve_hardcoded_sources(project_root))
    if not sources:
        sources = [default_lootr]
    sources = _dedupe_paths(sources)

    processed = process_all(sources, args.output, project_root, args.format)
    print(
        f"Processed {processed} file(s). Output written under: {args.output} (format: {args.format})"
    )
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
