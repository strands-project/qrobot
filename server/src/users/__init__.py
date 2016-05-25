from flask_classful import FlaskView
from app.models import User
from flask_jwt import jwt_required
from app.helpers import get_by_id_or_404


class UsersView(FlaskView):

    @jwt_required()
    def get(self, id):
        return get_by_id_or_404(User, id)
