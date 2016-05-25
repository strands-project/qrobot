import datetime

from src.extensions import db
from src.models.file import ImageFile, PointCloudFile
from src.helpers import GetByIdMixin


class Question(db.Document, GetByIdMixin):
    meta = {'collection': 'questions'}

    created = db.DateTimeField(default=datetime.datetime.now)
    soma_id = db.StringField()
    images = db.ListField(db.ReferenceField(ImageFile), db_field='image_ids')
    point_cloud = db.ReferenceField(PointCloudFile, db_field='point_cloud_id')
    suggested_labels = db.ListField(db.StringField())
