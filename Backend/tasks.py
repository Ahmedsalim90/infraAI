import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from flask_socketio import SocketIO
from celery_app import celery
from ai_pipeline import generate_design

load_dotenv()
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# A separate SocketIO client that only talks to Redis, not to Flask.
# This is how a Celery worker (a different process) can broadcast an
# event into the same room your real app.py server is watching.
socketio_emit_client = SocketIO(message_queue=REDIS_URL)


@celery.task(name="tasks.generate_design_task")
def generate_design_task(project_id, prompt):
    print(f"[Celery] Generating design for project {project_id}, prompt: {prompt}")

    try:
        design = generate_design(prompt)
    except Exception as e:
        print(f"[Celery] generate_design failed: {e}")
        socketio_emit_client.emit("design_generation_failed", {
            "project_id": project_id,
            "error": str(e)
        }, room=str(project_id))
        return

    print(f"[Celery] Design generated, saving to database for project {project_id}")

    # Importing app/db here (not at the top of the file) avoids circular
    # imports, since app.py itself imports things that eventually lead
    # back here. This is a common pattern for Celery tasks that need
    # database access.
    from app import app
    from models_auth import db
    from models import Design

    with app.app_context():
        last = (
            Design.query
            .filter_by(project_id=project_id)
            .order_by(Design.version.desc())
            .first()
        )
        next_version = (last.version + 1) if last else 1

        new_design = Design(
            project_id=project_id,
            version=next_version,
            prompt=prompt,
            design_json=design
        )
        db.session.add(new_design)
        db.session.commit()
        print(f"[Celery] Saved as Design id={new_design.id}, version={next_version}")

    print(f"[Celery] Emitting design_generated to room {project_id}")
    socketio_emit_client.emit("design_generated", {
        "project_id": project_id,
        "design": design
    }, room=str(project_id))

    return design