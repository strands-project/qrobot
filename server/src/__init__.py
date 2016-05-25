import sys

from flask import Flask, request, current_app

from . import extensions
from src.auth import jwt
#  from .objects import ObjectsView
from src.helpers import MongoEngineJSONEncoder, jsonify
from src.endpoints.file import blueprint as file_blueprint
from src.endpoints.user import blueprint as user_blueprint
from src.endpoints.question import blueprint as question_blueprint


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object('config.{}Config'.format(config_name.capitalize()))
    if config_name == 'production':
        app.config.from_pyfile('../../config/flask.py')
    app.json_encoder = MongoEngineJSONEncoder
    jwt.set_jwt_handlers(extensions.jwt)
    extensions.jwt.init_app(app)
    extensions.mail.init_app(app)
    if config_name == 'development':
        extensions.db.init_app(app)
    elif config_name == 'production':
        from uwsgidecorators import postfork
        @postfork
        def init_db():
            extensions.db.init_app(app)
    #  ObjectsView.register(app)
    app.register_blueprint(question_blueprint, url_prefix='/api/question')
    app.register_blueprint(file_blueprint, url_prefix='/api/file')
    app.register_blueprint(user_blueprint, url_prefix='/api/user')
    if app.config['DEBUG']:
        app.before_request(print_request)
        app.after_request(add_cors_and_print_response)
    if config_name == 'production':
        import logging
        from logging.handlers import TimedRotatingFileHandler
        trfh = TimedRotatingFileHandler(app.config['LOG_FILENAME'],
                                        when='midnight',
                                        backupCount=app.config['LOG_BACKUP_COUNT'])
        trfh.setLevel(logging.WARNING)
        app.logger.addHandler(trfh)
    return app


def print_request():
    if request.headers['Content-Type'] == 'application/json':
        sys.stdout.write('JSON request content:\n')
        sys.stdout.write(jsonify(request.get_json()).data.decode('utf-8'))


def add_cors_and_print_response(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:8000'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization,Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    response.headers['Access-Control-Max-Age'] = '1'
    if response.headers['Content-Type'] == 'application/json':
        sys.stdout.write('JSON response content:\n')
        sys.stdout.write(response.data.decode('utf-8'))
    return response
