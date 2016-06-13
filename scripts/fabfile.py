import os
import os.path
from fabric.api import cd, env, lcd, put, prompt, local, sudo, run, local
from fabric.contrib.files import exists

HOST = '{STAGING_HOST}:{STAGING_SSH_PORT}'.format(**os.environ)
ADMIN = os.environ['STAGING_ADMIN']

env.hosts = [HOST]
env.user = ADMIN

REMOTE_HOME = '/home/qrobot'
REMOTE_GIT = os.path.join(REMOTE_HOME, 'git')
REMOTE_REPO = os.path.join(REMOTE_HOME, 'repo')

LOCAL_CONFIG = './config'


def create_user():
    """
    Create a user for the app and setup passwordless login.
    """
    sudo('adduser qrobot --disabled-password --gecos ""')
    sudo('mkdir -p /home/qrobot/.ssh')
    p = open(os.path.join(os.environ['HOME'], '.ssh', 'id_rsa.pub'), 'r').read()
    sudo('echo "{}" >> /home/qrobot/.ssh/authorized_keys'.format(p))
    sudo('chown qrobot:qrobot "/home/qrobot/.ssh" -R')
    sudo('chmod 600 /home/qrobot/.ssh/authorized_keys')


def setup_git():
    """
    Setup git repositories (both local and remote).
    """
    env.user = 'qrobot'
    local('git remote add staging ssh://qrobot@{}{}'.format(HOST, REMOTE_GIT))
    if not exists(REMOTE_REPO):
        run('mkdir ' + REMOTE_REPO)
    if not exists(REMOTE_GIT):
        run('mkdir ' + REMOTE_GIT)
        with cd(REMOTE_GIT):
            run('git init --bare')
            local('git push staging master')
            run('GIT_WORK_TREE="{}" git checkout -f'.format(REMOTE_REPO))
            with lcd(LOCAL_CONFIG):
                with cd('hooks'):
                    put('post-receive', 'post-receive', mode=0O775)

def bootstrap():
    """
    Bootstrap the app from the repository.
    """
    env.user = ADMIN
    with cd(REMOTE_REPO):
        sudo('./scripts/bootstrap.sh production')


def setup_staging():
    create_user()
    setup_git()
    bootstrap()
