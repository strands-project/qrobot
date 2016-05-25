import datetime

from src.extensions import db
from .question import Question
from .user import User


class Answer(db.Document):
    meta = {'collection': 'answers'}

    question = db.ReferenceField(Question, db_field='question_id')
    user = db.ReferenceField(User, db_field='user_id')
    labels = db.ListField(db.StringField())
    created = db.DateTimeField(default=datetime.datetime.now)
    duration = db.IntField()
