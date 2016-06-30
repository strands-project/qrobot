from flask import Blueprint, request
from flask_jwt import jwt_required, current_identity

from src.helpers import jsonify
from src.models import User, Feedback


blueprint = Blueprint('feedback', __name__)


@blueprint.route('', methods=['POST'])
@jwt_required()
def submit():
    data = request.get_json()
    user = User.get_by_id(current_identity.id)
    feedback = Feedback()
    feedback.user = user
    feedback.message = data['message']
    feedback.browser = data['browser']
    feedback.save()
    return jsonify(status='success', message='Thanks for sharing your opinion with us!')
