import os
from invoke import Collection, task, run

import tasks.db


@task
def build():
    print("Building!")


@task
def install():
    run('pip install -r server/requirements.pip')
    run('pip install -r server/requirements.development.pip')
    os.chdir('client')
    run('npm install')


@task
def deploy():
    run('git push --tags --force vm master')


def get_next_revision_number():
    out = run('git tags --list "r*"').stdout
    tags = list()
    for tag in out.strip().split():
        try:
            tags.append(int(tag[1:]))
        except:
            pass
    return 1 if not tags else sorted(tags)[-1] + 1


@task
def publish():
    run('git push')
    run('git push --tags')


@task(post=[publish])
def release():
    os.chdir(os.environ['PROJECT_CLIENT'])
    print(run('npm run build'))
    run('mkdir -p dist')
    run('cp -r build/* dist')
    run('git checkout -b pre-release')
    run('git add dist')
    rev = get_next_revision_number()
    run('git commit -m "Release revision {}"'.format(rev))
    run('git tag r{}'.format(rev))
    run('git checkout master')
    run('git branch -D pre-release')


ns = Collection()
ns.add_task(build)
ns.add_task(install)
ns.add_task(deploy)
ns.add_task(release)
ns.add_task(publish)
ns.add_collection(tasks.db)
