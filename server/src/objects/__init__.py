#  from flask_classful import FlaskView
#  from app.objects.models import Object
#  from app.helpers import send_data, jsonify


#  class ObjectsView(FlaskView):
    #  trailing_slash = False

    #  def index(self):
        #  return jsonify(Object.objects.exclude('pcd'))

    #  def pcd(self, id):
        #  obj = Object.get_by_id(id)
        #  if obj:
            #  return send_data(obj.pcd, 'application/pcd')
        #  return 'Not found', 404
