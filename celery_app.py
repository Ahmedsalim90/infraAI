from celery import Celery
import time

celery = Celery(
    'infra_ai',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

@celery.task
def ping_task():
    return "pong"

@celery.task
def generate_design_task(user_id, room_id, prompt):
    # STUB: replace with real AI generation call once it's ready
    time.sleep(2)  # simulate generation time
    design = {
        "id": "stub-design-001",
        "prompt": prompt,
        "nodes": [],
        "edges": []
    }

    from app import socketio  # import here to avoid circular import
    socketio.emit('design_generated', {'design': design}, room=room_id)

    return design['id']

@celery.task
def edit_design_task(user_id, room_id, design_id, current_design, change_prompt):
    # STUB: replace with real AI edit-diff call once it's ready
    time.sleep(2)  # simulate AI processing time

    updated_design = dict(current_design)
    updated_design['id'] = design_id
    updated_design['last_edit'] = change_prompt

    from app import socketio
    socketio.emit('design_edited', {'design': updated_design}, room=room_id)

    return updated_design['id']

@celery.task
def import_design_task(user_id, room_id, file_url, file_type):
    # STUB: file_url is assumed already uploaded via Pod E's Cloudinary flow
    # file_type is either "image" or "json"
    time.sleep(2)  # simulate AI parsing/refinement time

    if file_type == "json":
        design = {
            "id": "stub-import-001",
            "source": "json_import",
            "file_url": file_url,
            "nodes": [],
            "edges": []
        }
    else:
        design = {
            "id": "stub-import-001",
            "source": "image_import",
            "file_url": file_url,
            "nodes": [],
            "edges": []
        }

    from app import socketio
    socketio.emit('design_generated', {'design': design}, room=room_id)

    return design['id']
