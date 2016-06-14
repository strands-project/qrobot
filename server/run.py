import os
import sys
from src import create_app

application = create_app(os.getenv('FLASK_CONFIG') or 'development')


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'shell':
        from IPython import embed
        from src.extensions import db, mail
        context = dict(app=application, db=db, mail=mail)
        embed(user_ns=context)
    else:
        application.run(threaded=True, port=int(os.environ['DEV_BACKEND_PORT']))
