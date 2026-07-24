VALID_ROLES = {"Admin", "Editor", "Viewer"}

# Simple in-memory user store: {user_id: {"name": ..., "role": ...}}
USERS = {
    1: {"name": "Alice", "role": "Admin"},
    2: {"name": "Bob", "role": "Viewer"},
    3: {"name": "Carla", "role": "Editor"},
}


def get_user(user_id):
    return USERS.get(user_id)


def set_user_role(user_id, new_role):
    if user_id not in USERS:
        return None, "User not found"
    if new_role not in VALID_ROLES:
        return None, f"Invalid role. Must be one of {sorted(VALID_ROLES)}"
    USERS[user_id]["role"] = new_role
    return USERS[user_id], None