import os

APP_DIR = os.path.dirname(__file__)
ROOT_DIR = os.path.dirname(APP_DIR)
DIST_DIR = os.path.join(APP_DIR, 'frontend/dist')
STATIC_DIR = os.path.join(DIST_DIR, 'static')

if os.path.isfile("qb-frontend.env"):
  with open('qb-frontend.env', 'r') as fh:
    vars_dict = {}
    for line in fh.readlines():
      if line.startswith('#') or line.startswith('\n'):
        continue
      pair = line.split("=")
      vars_dict[pair[0]] = pair[1].strip()

  os.environ.update(vars_dict)

MODE=os.getenv('MODE', "production")
###############################################################
# NETWORK SOCKET PARAMETERS
###############################################################
IP_ADDRESS=os.getenv("IP_ADDRESS", "0.0.0.0") 
PORT=int(os.getenv("PORT", "5555")) 
# WORKERS=int(os.getenv("WORKERS", "1"))

###############################################################
# DEVELOPMENT ENV FILE
###############################################################
DEBUG=os.getenv("DEBUG", False) 
USE_HTTPS=os.getenv("USE_HTTPS", False)