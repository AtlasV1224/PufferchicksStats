import uuid
import struct
import os
import json5
import json

# Username Lookup table
usernames = {
    "AtlasV1224": "7c7518ea-d77c-401e-805e-3fecb9d3f888",
    "tlitookilakin": "8ee61ef3-1eee-4867-96c6-c9ee708cd1ea",
    "Pinkmoney": "8fa2d575-05fe-4af0-a62f-d8493aecae66",
    "kittycatcasey": "9beee7d5-6f24-45b4-acf2-bcd3cab184a2",
    "DecidedlyHuman": "83caec38-58b8-4d24-95ec-209eefc8ce73",
    "Erinthe": "246bc0d1-c5f6-418e-baaf-a9b632ace079",
    "Super_MrSpring": "2886d944-b171-413f-ad25-4d5f27ee46ed",
    "Spiderbuttons": "07304b7d-1ab9-49ea-9995-35fba7b17e4a",
    "Xeragene": "7746f2d4-a4d7-4d6a-bb59-82ad6ecd6725",
    "shekurika": "051295fe-8aec-44aa-84c6-f9b6eea8245c",
    "KhloeLeclair": "41481473-e075-4896-adcd-0e91c89606df",
    "pneuma163": "55725902-ad5d-4a1f-9ee3-3e3c61f6102a",
    "TheFrenchDodo": "b279d81d-dd25-418f-b78c-6ae7282d26c5",
    "ScarletCraft": "d1a2643a-fd66-4af6-81f4-1b7b8cd86653",
    "skellady": "ddbd74b6-8302-4f93-ae1d-9ca8db5000a0",
    "Pil_": "e054b62a-e6d7-475d-8fae-a4ebf98c8519",
    "SinZ": "e0989ba6-7eee-4ad1-9c49-88fc6db8e7e5",
    "LeFauxMatt": "ec1b0b30-782d-44ec-8e06-79def1444c26",
}

def convert_user(target_format, value):
    """
    Convert between UUID, Username, and IntArray formats.

    target_format: "UUID", "Username", "IntArray"
    value: can be a UUID string, username string, or IntArray (list/tuple of 4 int32)
    """

    # --- Step 1: Resolve input to UUID ---
    if isinstance(value, str):
        # If input is a username, lookup UUID
        if value in usernames:
            value = usernames[value]
        # Otherwise, assume it's a UUID string
    elif isinstance(value, (list, tuple)):
        # IntArray → UUID
        if len(value) != 4:
            raise ValueError("Expected an array of four 32-bit integers.")
        b = b"".join(struct.pack(">I", i & 0xFFFFFFFF) for i in value)
        value = str(uuid.UUID(bytes=b))
    else:
        raise ValueError("Unsupported input type.")

    # Validate UUID
    try:
        u = uuid.UUID(str(value))
        uuid_str = str(u)
    except Exception:
        raise ValueError("Value must resolve to a valid UUID.")

    # --- Step 2: Convert UUID to target format ---
    if target_format == "UUID":
        return uuid_str

    if target_format == "Username":
        # Reverse lookup: UUID → Username
        for username, uid in usernames.items():
            if uid == uuid_str:
                return username
        else:
            return f"No username found for UUID: {uuid_str}"

        # raise ValueError(f"No username found for UUID: {uuid_str}")

    if target_format == "IntArray":
        b = u.bytes
        return [struct.unpack(">i", b[i:i + 4])[0] for i in range(0, 16, 4)]

    raise ValueError(f"Invalid target format: {target_format}")


def extract_json_data(directory, key_path):
    """
    Reads all JSON/JSON5 files in a directory recursively and returns the requested data.

    :param directory: str, path to the directory
    :param key_path: str or list, key or nested keys to retrieve
    :return: list of values matching the key_path in all files
    """
    if isinstance(key_path, str):
        key_path = [key_path]

    results = []

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.json', '.json5')):
                filepath = os.path.join(root, file)
                try:
                    print(f"opening: {filepath}")
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json5.load(f)

                    value = data
                    for key in key_path:
                        if isinstance(value, dict) and key in value:
                            value = value[key]
                        else:
                            value = None
                            break

                    if value is not None:
                        results.append(value)
                except Exception:
                    continue
    return results

def write_json(out_data, out_path, action="overwrite"):
    """
    Writes data to a .json file.

    :param out_data: any, data to write to the .json file
    :param out_path: str, path to the .json file
    :param action: append or overwrite
    """

    if action not in ("append", "overwrite"):
        raise ValueError("action must be 'append' or 'overwrite'")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    # Overwrite
    if action == "overwrite":
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(out_data, f, indent=4)
        return

    # Append, loads existing data and appends to it
    existing = []
    if os.path.exists(out_path):
        with open(out_path, "r", encoding="utf-8") as f:
            try:
                existing = json.load(f)
                if not isinstance(existing, list):
                    raise ValueError("append requires the JSON file to contain a list")
            except json.JSONDecodeError:
                raise ValueError("invalid JSON file content to append")

    existing.append(out_data)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=4)


