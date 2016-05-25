from app.users.models import User
import bson


def is_username_available(username):
    """
    Check if a given username is available.
    :username: string
    :returns: True or False
    """
    return User.objects.filter(username=username).first() is None


def get_user_by_id(id):
    """
    Get the user with a given id
    :id: string or ObjectId
    :returns: User
    """
    try:
        #  if isinstance(id, str):
        id = bson.objectid.ObjectId(id)
    except bson.errors.InvalidId:
        return None
    return User.objects(id=id).first()

