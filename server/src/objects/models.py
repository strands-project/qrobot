from app.extensions import db
from app.helpers import GetByIdMixin


class Object(db.Document, GetByIdMixin):
    """
    Object model
    """

    label = db.StringField()
    pcd = db.BinaryField()
