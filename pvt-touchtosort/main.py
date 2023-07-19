#!/usr/bin/python3.7
from app import application
from app.config import IP_ADDRESS, PORT, DEBUG # CERTIFICATE_FILE, CERTIFICATE_KEY_FILE, USE_HTTPS, 
import argparse

# Instantiate the parser
parser = argparse.ArgumentParser()

# Required positional argument
parser.add_argument('-i', '--ip', type=str,
                    help='host ip address')
parser.add_argument('-p', '-P', '--port', type=int,
                    help='host port')
# Optional positional argument
parser.add_argument('--debug', type=bool, default=False,
                    help='debug mode')

args = parser.parse_args()



def main():
  if args.ip == None and args.port == None:
    application.run(host=IP_ADDRESS, port=PORT, debug=DEBUG)
  else:
    application.run(host=args.ip, port=args.port, debug=args.debug)


if __name__ == "__main__":
  main()
