from uuid import UUID
import helpers
import json5
import json


def _yield_intarrays(node):
    """
    Recursively walk any nested structure and yield each IntArray found
    (a list/tuple of exactly four ints).
    """
    if isinstance(node, (list, tuple)):
        # IntArray candidate
        if len(node) == 4 and all(isinstance(x, int) for x in node):
            yield tuple(node)
        else:
            for item in node:
                yield from _yield_intarrays(item)
    elif isinstance(node, dict):
        for v in node.values():
            yield from _yield_intarrays(v)


def count_unique_user_occurrences(directory, key_path, out_path):
    """
    Use helpers.extract_json_data to collect all values at ["data", "actualOpeners"]
    across lootr files, traverse them to find IntArrays, and count unique occurrences.

    Returns a dict mapping IntArray tuples to their counts.
    """
    values = helpers.extract_json_data(directory, key_path)
    counts = {}
    for value in values:
        for arr in _yield_intarrays(value):
            counts[arr] = counts.get(arr, 0) + 1

    output_data = {}
    for key, value in counts.items():
        username = helpers.convert_user("Username", key)
        output_data[username] = value

    helpers.write_json(output_data, out_path, "overwrite")


if __name__ == "__main__":
    count_unique_user_occurrences("Output/Backups/Season1/data/lootr", ["data", "actualOpeners"], "Sorted/global/lootrCount.json")