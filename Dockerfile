FROM ubuntu:18.04

RUN apt-get update && apt-get install -y curl \
    ca-certificates \ 
    software-properties-common \
    lsb-release

RUN curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get update && apt-get install -y nodejs

RUN apt-get update && apt-get install -y python3.7 python3.7-dev python3-pip
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.7 1
RUN python3 -m pip install --upgrade pip
RUN python3 -m pip install \
            Sanic==20.12.1 \
            sanic-jwt==1.6.0 \
            Sanic-Cors==0.10.0.post3 \
            Jinja2==2.11.1 \
            ConfigParser==5.0.0 \
            dnspython==1.16.0 \
            cryptography==3.3.1 \
            PyJWT==2.0.0 \
            markupsafe==2.0.1 \
            pymongo \
            pandas \
            aiohttp_cors \
            aiohttp

RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN npm install -g @vue/cli @vue/cli-service

# pvt-frontend
WORKDIR /usr/src/pvt-frontend/

COPY ./pvt-frontend/app/frontend/package.json ./app/frontend/package.json

RUN npm install --prefix app/frontend

COPY ./pvt-frontend /usr/src/pvt-frontend/

RUN npm run build --prefix app/frontend

# pvt-dimensioner
WORKDIR /usr/src/pvt-frontend-dimensioner/

COPY ./pvt-frontend-dimensioner/app/frontend/package.json ./app/frontend/package.json

RUN npm install --prefix app/frontend

COPY ./pvt-frontend-dimensioner /usr/src/pvt-frontend-dimensioner/

RUN npm run build --prefix app/frontend

EXPOSE 5555
EXPOSE 5556

COPY ./scripts/ /usr/src/

CMD [ "/bin/bash", "/usr/src/starter.sh"]