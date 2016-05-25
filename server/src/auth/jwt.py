from flask import jsonify

from src.models import User


def set_jwt_handlers(jwt):

    @jwt.authentication_handler
    def authenticate(email, password):
        user = User.objects(email=email).first()
        if user and user.verify_password(password):
            # Replace ObjectId with simple string
            # Without this json_encoder (used by jwt.encode) will choke
            user.id = str(user.id)
            return user

    @jwt.identity_handler
    def identify(payload):
        return User.get_by_id(payload['identity'])

    @jwt.auth_response_handler
    def auth_response_handler(access_token, identity):
        return jsonify(token=access_token.decode('utf-8'))
