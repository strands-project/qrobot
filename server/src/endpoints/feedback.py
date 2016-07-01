from flask import Blueprint, request, render_template, current_app
from flask_jwt import jwt_required, current_identity
from flask_mail import Message

from src.helpers import jsonify
from src.models import User, Feedback
from src.extensions import mail


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
    mail.send(_create_feedback_message(feedback))
    return jsonify(status='success', message='Thanks for sharing your opinion with us!')


def _create_feedback_message(feedback):
    html = render_template('email/feedback.html', feedback=feedback)
    return Message('QRobot - Feedback left by a user',
                   recipients=[current_app.config['MAIL_ADMIN']],
                   html=html)
