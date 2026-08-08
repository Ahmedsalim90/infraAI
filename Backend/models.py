from datetime import datetime
from models_auth import db, User, Role


class Project(db.Model):
    """
    Represents one infrastructure design project. Matches Nabil's (A2)
    Day 1 task: "Write Project and ProjectMember models".
    """
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_validated = db.Column(db.Boolean, nullable=False, default=False, server_default=db.text("false"))

    owner = db.relationship("User", backref="owned_projects")
    members = db.relationship("ProjectMember", backref="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.name}>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None,
            "is_validated": self.is_validated
        }


class ProjectMember(db.Model):
    """
    Join table connecting Users to Projects, storing each user's role
    within that specific project (owner, editor, viewer). role_id
    references Alfred's shared Role table, per his design intent, rather
    than a plain string — keeps project-level and system-level roles
    using one shared vocabulary.
    """
    __tablename__ = "project_members"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)

    user = db.relationship("User")
    role = db.relationship("Role")

    __table_args__ = (
        db.UniqueConstraint("project_id", "user_id", name="unique_project_member"),
    )

    @property
    def role_name(self) -> str:
        return self.role.name if self.role else None

           
    def __repr__(self):
        return f"<ProjectMember user={self.user_id} project={self.project_id} role={self.role_name}>"

class Design(db.Model):
   
     __tablename__ = "designs"

     id = db.Column(db.Integer, primary_key=True)
     project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
     version = db.Column(db.Integer, nullable=False, default=1)
     prompt = db.Column(db.Text, nullable=True)  
     design_json = db.Column(db.JSON, nullable=False) 
     created_at = db.Column(db.DateTime, default=datetime.utcnow)

     project = db.relationship("Project", backref="designs")

     def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "version": self.version,
            "prompt": self.prompt,
            "design": self.design_json,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None
        }
class Comment(db.Model):
    """
    A single chat message in a project's comment feed. Simple and flat —
    no threading/replies, just a running feed everyone on the project
    can see and post to.
    """
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    project = db.relationship("Project", backref="comments")
    user = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "content": self.content,
           "created_at": self.created_at.isoformat() + "Z" if self.created_at else None
        }
