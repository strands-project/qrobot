from collections import namedtuple
from passlib.apps import custom_app_context as pwd_context
from flask import current_app

from src.extensions import db, jwt
from src.helpers import GetByIdMixin, encode_token, decode_token


class User(db.Document, GetByIdMixin):
    meta = {'collection': 'users'}

    name = db.StringField(required=True)
    email = db.StringField(required=True, unique=True)
    password_hash = db.StringField(required=True)
    email_confirmed = db.BooleanField(required=True, default=False)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def __setattr__(self, name, value):
        if name == 'password':
            self.password_hash = pwd_context.encrypt(value)
        else:
            super(User, self).__setattr__(name, value)

    @property
    def access_token(self):
        identity = namedtuple('Identity', ['id'])(str(self.id))
        return jwt.jwt_encode_callback(identity).decode('utf-8')

    @property
    def email_confirmation_token(self):
        return encode_token(self.email)

    def verify_email_confirmation_token(self, token):
        email = decode_token(token)
        if email == self.email:
            return 'valid'
        else:
            return 'invalid'

    @classmethod
    def is_email_available(cls, email):
        """
        Check if a given email is available.
        """
        return cls.objects.filter(email=email).first() is None
