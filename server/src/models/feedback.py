import datetime

from src.extensions import db
from .user import User


class Feedback(db.Document):
    meta = {'collection': 'feedback'}

    user = db.ReferenceField(User, db_field='user_id')
    created = db.DateTimeField(default=datetime.datetime.now)
    message = db.StringField()
    browser = db.StringField()
