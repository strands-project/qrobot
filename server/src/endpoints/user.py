from flask import Blueprint, request, current_app, render_template
from flask_jwt import jwt_required, current_identity
from flask_mail import Message

from src.helpers import jsonify, get_by_id_or_404, frontend_url_for
from src.models import User
from src.extensions import jwt, mail


blueprint = Blueprint('user', __name__)


@blueprint.route('', methods=['GET'])
@jwt_required()
def get_current():
    user = User.get_by_id(current_identity.id)
    # Wipe password hash so that we do not send it over the network
    del user.password_hash
    return jsonify(user)


@blueprint.route('', methods=['POST'])
def signup():
    data = request.get_json()
    if not User.is_email_available(data['email']):
        return jsonify(status='error', message='This e-mail is already registered')
    user = User()
    user.email = data['email']
    user.password = data['password']
    user.name = data['name']
    user.save()
    mail.send(_create_email_confirmation_message(user))
    return jsonify(status='success',
                   message='We have created an account and sent a confirmation link to the provided e-mail address',
                   token=user.access_token), 201


@blueprint.route('/confirm/<token>', methods=['POST'])
@jwt_required()
def confirm_email(token):
    result = current_identity.verify_email_confirmation_token(token)
    if result == 'valid':
        current_identity.email_confirmed = True
        current_identity.save()
        return jsonify(status='success', message='E-mail confirmed')
    else:
        return jsonify(status='error', message='Invalid confirmation token')


@blueprint.route('/resend', methods=['POST'])
@jwt_required()
def resend():
    mail.send(_create_email_confirmation_message(current_identity))
    return jsonify(status='success',
                   message='We have sent a confirmation link to the provided e-mail address')


def _create_email_confirmation_message(user):
    confirm_url = frontend_url_for('.confirm_email',
                                   token=user.email_confirmation_token,
                                   _external=True)
    html = render_template('email/confirm.html', confirm_url=confirm_url)
    return Message('QRobot - Please confirm your e-mail address',
                   recipients=[user.email],
                   body=html)
