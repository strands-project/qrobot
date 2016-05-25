from flask import Blueprint, request
from flask_jwt import jwt_required, current_identity

from src.helpers import jsonify, get_by_id_or_404
from src.models import Answer, Question


blueprint = Blueprint('question', __name__)


@blueprint.route('', methods=['GET'])
@jwt_required()
def get_any():
    for q in Question.objects.no_dereference():
        if not Answer.objects(user=current_identity.id, question=q):
            return jsonify(q)
    return jsonify(message='No unanswered questions')


@blueprint.route('/<id>', methods=['GET'])
def get_by_id(id):
    return get_by_id_or_404(Question, id)


@blueprint.route('/answer', methods=['POST'])
@jwt_required()
def answer():
    answer = Answer.from_json(request.data.decode('utf-8'))
    if current_identity != answer.user:
        return 'User identity does not match', 403
    if Answer.objects(user=answer.user, question=answer.question):
        return 'This questions was already answered', 403
    answer.save()
    #  import time
    #  time.sleep(3)
    # NOTE jsonify, otherwise ampersand-sync won't trigger success event
    return jsonify(status='success', message='Answer saved')


@blueprint.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    questions = Question.objects.count()
    answers = Answer.objects(user=current_identity.id).count()
    return jsonify(status='success', questions=questions, answers=answers)

