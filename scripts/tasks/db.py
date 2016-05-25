import os
import random
from invoke import task, run
from src import create_app
from src.extensions import db
from src.models import User, ImageFile, PointCloudFile, Question, Answer


@task
def import_(archive):
    print('importing database {}'.format(archive))
    pass


@task
def populate(collection=None):
    app = create_app('development')
    if collection in ['users', None]:
        User.drop_collection()
        u = User()
        u.name = 'Sergey'
        u.password = 'foobar123'
        u.email = 'alexandrov88@gmail.com'
        u.email_confirmed = False
        u.save()
        u = User()
        u.name = 'John'
        u.password = 'foobar123'
        u.email = 'john@doe.com'
        u.email_confirmed = True
        u.save()
    if collection in ['files', None]:
        ImageFile.drop_collection()
        PointCloudFile.drop_collection()
        d = os.path.join(os.environ['PROJECT_ROOT'], 'data')
        for fn in os.listdir(d):
            if fn.endswith('.jpg'):
                f = ImageFile()
            elif fn.endswith('.pcd'):
                f = PointCloudFile()
            f.data = open(os.path.join(d, fn), 'rb').read()
            f.save()
    if collection in ['questions', None]:
        Question.drop_collection()
        labels = ['Bottle', 'Mug', 'Carton', 'Figurine', 'Pot', 'Pen', 'Box',
                  'Basket', 'Fire extinguisher', 'Owl', 'Paper', 'Monitor',
                  'Display', 'Screen', 'Stapler', 'Cup', 'Mouse', 'Glasses']
        imgs = list(ImageFile.objects.all())
        pcds = list(PointCloudFile.objects.all())
        for i in range(10):
            q = Question()
            q.suggested_labels = random.sample(labels, 5)
            q.soma_id = 'a5712-5cd83f5b3152a6-63bd3{}'.format(i)
            q.images = random.sample(imgs, 2 + random.randint(0, 2))
            q.point_cloud = random.choice(pcds)
            q.save()


@task
def drop(collection=None):
    app = create_app('development')
    if collection in ['answers', None]:
        Answer.drop_collection()
