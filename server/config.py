from datetime import timedelta


class Config(object):
    MONGODB_HOST = 'localhost'
    MONGODB_PORT = 27017
    SECRET_KEY = 'OcDWIH7AVMvyeGRZEiM0IlcDDrsfbDQi'
    SECRET_SALT = 'thiet0Cah4aiPh7E'
    JWT_AUTH_URL_ROUTE = '/api/auth'
    JWT_AUTH_URL_RULE = '/api/auth'
    JWT_EXPIRATION_DELTA = timedelta(days=1)
    JWT_AUTH_USERNAME_KEY = 'email'
    MAIL_SERVER = 'localhost'
    MAIL_PORT = 25
    MAIL_DEFAULT_SENDER = 'support@qrobot.com'
    DEBUG = False
    TESTING = False


class ProductionConfig(Config):
    MONGODB_DB = 'qrobot'


class DevelopmentConfig(Config):
    MONGODB_DB = 'development'
    MAIL_PORT = 2525
    DEBUG = True


class TestingConfig(Config):
    MONGODB_DB = 'testing'
    TESTING = True
    DEBUG = False
