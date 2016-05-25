#TODO import user properly
class User:
    def __init__(self, username):
        self.username = username


def authenticate(username, password):
    if username == password:
        return User(username)
    return None
    #  user = username_table.get(username, None)
    #  if user and safe_str_cmp(user.password.encode('utf-8'), password.encode('utf-8')):
        #  return user


def identity(payload):
    return User('mr.patito')
    #  user_id = payload['identity']
    #  return userid_table.get(user_id, None)

