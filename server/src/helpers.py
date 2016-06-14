import os
import bson
import mongoengine
from io import BytesIO
from flask import send_file, current_app, request, url_for
from flask.json import JSONEncoder, dumps
from itsdangerous import URLSafeTimedSerializer


def frontend_url_for(endpoint, **values):
    url = url_for(endpoint, **values).replace('/api', '', 1)
    try:
        host = os.environ['DEV_HOST']
        fp = os.environ['DEV_FRONTEND_PORT']
        bp = os.environ['DEV_BACKEND_PORT']
        url = url.replace('{}:{}'.format(host, bp), '{}:{}'.format(host, fp))
    except KeyError:
        pass
    return url


def send_data(data, mimetype):
    rv = send_file(BytesIO(data), mimetype=mimetype)
    rv.headers.extend({ 'Content-Length': len(data) })
    return rv


def get_by_id_or_404(cls, id):
    obj = cls.get_by_id(id)
    if obj:
        return jsonify(obj)
    return 'Not found', 404


class MongoEngineJSONEncoder(JSONEncoder):

    def default(self, obj):
        if isinstance(obj, bson.objectid.ObjectId):
            return str(obj)
        return JSONEncoder.default(self, obj)


def encode_token(data):
    ts = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    token = ts.dumps(data, salt=current_app.config['SECRET_SALT'])
    if current_app.config['DEBUG']:
        token = token.replace('.', '+')
    return token


def decode_token(data, max_age=None):
    ts = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    if current_app.config['DEBUG']:
        data = data.replace('+', '.')
    token = ts.loads(data, salt=current_app.config['SECRET_SALT'],
                     max_age=max_age)
    return token


def jsonify(*args, **kwargs):
    indent = None
    separators = (',', ':')

    if current_app.config['JSONIFY_PRETTYPRINT_REGULAR'] and not request.is_xhr:
        indent = 2
        separators = (', ', ': ')

    if args and kwargs:
        raise TypeError('jsonify() behavior undefined when passed both args and kwargs')
    elif len(args) == 1:  # single args are passed directly to dumps()
        data = args[0]
        if isinstance(data, mongoengine.document.Document):
            data = data.to_mongo()
        if isinstance(data, mongoengine.queryset.QuerySet):
            data = [doc.to_mongo() for doc in data]
    else:
        data = args or kwargs

    return current_app.response_class(
        (dumps(data, indent=indent, separators=separators), '\n'),
        mimetype='application/json'
    )


class GetByIdMixin(object):
    @classmethod
    def get_by_id(cls, id):
        try:
            id = bson.objectid.ObjectId(id)
        except bson.errors.InvalidId:
            return None
        return cls.objects(id=id).first()
