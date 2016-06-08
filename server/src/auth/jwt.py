from flask import jsonify, current_app, request

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

    @jwt.request_handler
    def request_handler():
        # Almost the same as the default request handler, but supports
        # authorization headers with multiple methods. For example, the
        # following is now possible:
        #   Authorization: Basic xxxx JWT yyyy
        auth_header_value = request.headers.get('Authorization', None)
        auth_header_prefix = current_app.config['JWT_AUTH_HEADER_PREFIX']
        if auth_header_value:
            parts = auth_header_value.split()
            for p in zip(parts[0::2], parts[1::2]):
                if p[0].lower() == auth_header_prefix.lower():
                    return p[1]
