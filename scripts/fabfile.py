import os
import os.path
from fabric.api import cd, env, lcd, put, prompt, local, sudo, run
from fabric.contrib.files import exists


project_name = 'qrobot'

local_app_dir = './flask_project'
local_config_dir = './config'

remote_app_dir = '/home/www'
remote_git_dir = '/home/git'
remote_flask_dir = remote_app_dir + '/flask_project'
remote_nginx_dir = '/etc/nginx/sites-enabled'
remote_supervisor_dir = '/etc/supervisor/conf.d'

env.hosts = ['localhost:2222']  # replace with IP address or hostname


remote = {
    'user': {
        'admin': 'sergey',
        'app': project_name
    },
    'dir': {
        'base': os.path.join('/home', project_name),
        'venv': os.path.join('/home', project_name, 'venv'),
        'git': os.path.join('/home', project_name, 'git'),
        'www': os.path.join('/home', project_name, 'www')
    }
}

local = {
    'dir': {
        'base': os.environ['PROJECT_ROOT'],
        'server': os.path.join(os.environ['PROJECT_ROOT'], 'server')
    }
}


def install_requirements():
    """
    Install required packages.
    """
    env.user = remote['user']['admin']
    sudo('apt-get update')
    sudo('apt-get install -y python3')
    sudo('apt-get install -y python3-dev')
    sudo('apt-get install -y python-pip')
    sudo('apt-get install -y python-virtualenv')
    sudo('apt-get install -y nginx')
    sudo('apt-get install -y supervisor')
    sudo('apt-get install -y git')
    sudo('apt-get install -y mongodb')


def create_user():
    """
    Create a remote user for the project
    """
    env.user = remote['user']['admin']
    sudo('adduser {} --disabled-password --gecos ""'.format(remote['user']['app']))
    sudo('echo "{}:{}" | chpasswd'.format(remote['user']['app'], project_name))


def setup_python():
    """
    1. Create project directories
    2. Create and activate a virtualenv
    3. Copy Flask files to remote host
    """
    env.user = remote['user']['app']
    #  if exists(remote_app_dir) is False:
        #  sudo('mkdir ' + remote_app_dir)
    #  if exists(remote_flask_dir) is False:
        #  sudo('mkdir ' + remote_flask_dir)
    with cd(remote['dir']['base']):
        if not exists(remote['dir']['venv']):
            run('virtualenv venv -p python3')
            for reqfile in ['requirements.pip', 'requirements.production.pip']:
                reqfile = os.path.join(local['dir']['server'], reqfile)
                for package in open(reqfile, 'r').readlines():
                    run('venv/bin/pip install {}'.format(package.strip()))
    #  with cd(remote_flask_dir):
        #  put('*', './', use_sudo=True)


def configure_supervisor():
    with lcd(local_config_dir):
        with cd('/etc/supervisor/conf.d'):
            put('supervisor', project_name + '.conf', use_sudo=True)
    sudo('supervisorctl reread')
    sudo('supervisorctl update')



def configure_nginx():
    """
    1. Remove default nginx config file
    2. Create new config file
    3. Setup new symbolic link
    4. Copy local config to remote config
    5. Restart nginx
    """
    sudo('/etc/init.d/nginx start')
    if exists('/etc/nginx/sites-enabled/default'):
        sudo('rm /etc/nginx/sites-enabled/default')
    config_en = os.path.join('/etc/nginx/sites-enabled', project_name)
    config_av = os.path.join('/etc/nginx/sites-available', project_name)
    if exists(config_en) is False:
        sudo('touch ' + config_av)
        sudo('ln -s ' + config_av + ' ' + config_en)
    with lcd(local_config_dir):
        with cd('/etc/nginx/sites-available'):
            put('nginx', project_name, use_sudo=True)
    sudo('/etc/init.d/nginx restart')


def configure_git():
    """
    1. Setup bare Git repo
    2. Create post-receive hook
    """
    env.user = remote['user']['app']
    if exists(remote['dir']['git']) is False:
        run('mkdir ' + remote['dir']['git'])
        with cd(remote['dir']['git']):
            run('git init --bare')
            with lcd(local_config_dir):
                with cd('hooks'):
                    put('post-receive', 'post-receive', mode=0O775)
    if not exists(remote['dir']['www']):
        run('mkdir ' + remote['dir']['www'])
