from flask import Blueprint

from src.models import ImageFile, PointCloudFile
from src.helpers import send_data


blueprint = Blueprint('file', __name__)


@blueprint.route('/image/<id>', methods=['GET'])
def get_image(id):
    f = ImageFile.get_by_id(id)
    if f is not None:
        MIMETYPES = {'image' : 'image/jpg', 'point_cloud': 'application/pcd'}
        return send_data(f.data, 'image/jpg')
    return 'Not found', 404


@blueprint.route('/pcd/<id>', methods=['GET'])
def get_point_cloud(id):
    f = PointCloudFile.get_by_id(id)
    if f is not None:
        return send_data(f.data, 'application/pcd')
    return 'Not found', 404
