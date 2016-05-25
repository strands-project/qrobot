import base64
import datetime

from src.extensions import db
from src.helpers import GetByIdMixin


class ImageFile(db.Document, GetByIdMixin):
    meta = {'collection': 'image_files'}

    created = db.DateTimeField(default=datetime.datetime.now)
    image = db.BinaryField()

    @property
    def data(self):
        return base64.b64decode(self.image)

    @data.setter
    def data(self, value):
        self.image = base64.b64encode(value)


class PointCloudFile(db.Document, GetByIdMixin):
    meta = {'collection': 'point_cloud_files'}

    created = db.DateTimeField(default=datetime.datetime.now)
    point_cloud = db.BinaryField()

    @property
    def data(self):
        return base64.b64decode(self.point_cloud)

    @data.setter
    def data(self, value):
        self.point_cloud = base64.b64encode(value)
