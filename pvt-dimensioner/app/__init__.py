from sanic import Sanic
from sanic import Blueprint, response
# from sanic_jwt import Initialize
# from jinja2 import Template, FileSystemLoader, Environment
from sanic.exceptions import Unauthorized, NotFound
import app.config
from sanic_cors import CORS, cross_origin
# from sanic_jwt.decorators import protected, scoped,inject_user
from sanic.log import logger
# from pymongo import MongoClient
import aiohttp


try:
  import app.version
except:
  pass

###############################################################
# CREATE MAIN APPLICATION
###############################################################
application = Sanic("QBFrontend")
CORS(application,resources={r"/*": {"origins": "*"}},supports_credentials=True)
application.config.from_object(app.config)
application.config.RESPONSE_TIMEOUT = 600
application.config.REQUEST_TIMEOUT = 600
application.static('/static', application.config.STATIC_DIR)
logger.info(f'>>> Current mode:{application.config.MODE} DEBUG:{application.config.DEBUG} DIST_DIR:{application.config.DIST_DIR}')

@application.exception(NotFound)
async def ignore_404s(request, exception):
    return response.text("404. Oops, That page couldn't found.")


async def server_error_handler(request, exception):
    return response.text('Oops, Sanic Server Error! Please contact the administrator',
                status=500)

###############################################################
# PREPARE AIOHTTP SESSION
###############################################################
@application.listener('before_server_start')
async def init(application, loop):
  application.aiohttp_session = aiohttp.ClientSession(loop=loop)

@application.listener('after_server_stop')
async def finish(application, loop):
  loop.run_until_complete(application.aiohttp_session.close())
  loop.close()


###############################################################
# CONNECT TO DATABASE
###############################################################
# db = client = MongoClient('localhost', 27017)["sorting-data"]



###############################################################
# LOAD MODULES
###############################################################

import app.frontend.views as frontend_views
views_bp = Blueprint.group(frontend_views.bp) 
application.blueprint(views_bp)



# Initialize( application, 
#             url_prefix='/api/auth', 
#             auth_mode=False
#             )
