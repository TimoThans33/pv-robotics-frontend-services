from sanic import Blueprint, request, response
from jinja2 import Template, FileSystemLoader, Environment
import os 
from sanic_jwt.decorators import protected, scoped,inject_user
import app.config as conf
import sys
from sanic.log import logger
# no prefix required
bp = Blueprint("frontend") 

# for pyinstaller
base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
env = Environment(loader=FileSystemLoader(os.path.join(base_path, conf.DIST_DIR)))
logger.info(f'>>> env:{os.path.join(base_path,conf.DIST_DIR)}')

@bp.route('/')
async def bp_root(request):
  return response.html( env.get_template(f"index.html").render() )

@bp.route('/<path:[^/].*?>')                                                                                                                                            
async def bp_static(request, path):  
  full_path = os.path.join(conf.DIST_DIR, path)
  if os.path.exists(full_path) and os.path.isfile(full_path):
    return await response.file_stream(full_path)

  else:
    # return normal index and let vue router solve the problem
    return response.html( env.get_template(f"index.html").render() )

@bp.route('/robots.txt')
async def robots(request):
  return text("User-agent: *\nDisallow: /")