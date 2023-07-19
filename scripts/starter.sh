#!/bin/bash

set -e

exec python3 /usr/src/server.py &
exec python3 /usr/src/pvt-frontend/main.py -i 0.0.0.0 -p 5555 &
exec python3 /usr/src/pvt-frontend-dimensioner/main.py -i 0.0.0.0 -p 5050