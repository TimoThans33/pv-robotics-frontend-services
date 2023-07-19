FROM ubuntu:18.04

##################################
#  Basic tools for Ubuntu image  #
##################################
RUN apt-get update && apt-get install -y curl \
    ca-certificates \ 
    software-properties-common \
    lsb-release
    
RUN curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh

RUN apt-get update && apt-get install -y nodejs
RUN apt-get update && apt-get install -y build-essential    
RUN apt-get update && apt-get install -y cmake
RUN apt-get update && apt-get install -y \
    sudo \
    wget \
    git \
    git-lfs \
    gnupg \
    gcc \
    g++ \
    make \
    openssh-server \
    google-mock \
    libssl1.0-dev \
    libgtest-dev \
    libssh2-1-dev

RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN wget -O - https://apt.llvm.org/llvm-snapshot.gpg.key | apt-key add -
RUN apt-add-repository "deb http://apt.llvm.org/bionic/ llvm-toolchain-bionic-13 main"
RUN apt-get update && apt-get install -y clang-format-13 libclang-cpp13 libllvm13 clang-tidy-13

RUN wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | gpg --dearmor - | tee /etc/apt/trusted.gpg.d/kitware.gpg >/dev/null
RUN apt-add-repository "deb https://apt.kitware.com/ubuntu/ $(lsb_release -cs) main"
RUN apt-get update && apt-get install -y cmake

###################################################
#  Specific dependencies needed for the software  #
###################################################
RUN apt-get update && apt-get install -y libboost-all-dev \
    libprotobuf-dev \
    liblmdb-dev \
    libffi-dev \
    protobuf-compiler \
    libeigen3-dev \
    libsodium-dev \
    libzmq3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN echo "Building spdlog"
RUN git clone --depth 1 --branch v1.8.0 https://github.com/gabime/spdlog.git \
    && cd spdlog && mkdir build && cd build \
    && cmake -DCMAKE_CXX_FLAGS="-fpic" .. && make -j2 && make install

RUN git clone --branch yaml-cpp-0.6.3 https://github.com/jbeder/yaml-cpp.git \
    && cd yaml-cpp && mkdir build && cd build \
    && cmake -DCMAKE_CXX_FLAGS="-fpic" .. && make -j4 && make install

RUN cd /tmp/; git clone -b release-1.11.0 --single-branch https://github.com/google/googletest.git
RUN cd /tmp/googletest; cmake .; cmake --build ./ --target install; cd ../..

RUN apt-get update && apt-get install -y python3.7 python3.7-dev python3-pip
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.7 1

RUN git clone --depth 1 --branch v3.10.5 https://github.com/nlohmann/json.git \
    && cd json  && mkdir build && cd build \
    && cmake -DJSON_BuildTests=Off .. && make -j2 && make install

RUN wget https://github.com/mongodb/mongo-c-driver/releases/download/1.17.0/mongo-c-driver-1.17.0.tar.gz \
    && tar xzf mongo-c-driver-1.17.0.tar.gz \
    && cd mongo-c-driver-1.17.0 \
    && rm -rf cmake-build \
    && mkdir cmake-build \
    && cd cmake-build \
    && cmake -DENABLE_AUTOMATIC_INIT_AND_CLEANUP=OFF -DENABLE_STATIC=ON .. \
    && make -j4 && sudo make install

RUN python3 -m pip install --upgrade pip
RUN python3 -m pip install \ 
                setuptools \
                pyinstaller \
                aiohttp

###################################################
#  mongodb  #
###################################################
RUN rm -rf mongo-cxx-driver && git clone --branch r3.5.1 https://github.com/mongodb/mongo-cxx-driver.git \
    && cd mongo-cxx-driver && rm -rf build && mkdir build && cd build && cmake -DCMAKE_INSTALL_PREFIX=/usr/local -DBUILD_SHARED_LIBS_WITH_STATIC_MONGOC=ON -DBUILD_SHARED_AND_STATIC_LIBS=ON -DCMAKE_BUILD_TYPE=Release .. \
    && make -j4 && sudo make install && sudo ldconfig

RUN npm install -g @vue/cli @vue/cli-service

COPY ./ /tmp/
RUN python3 -m pip install -r /tmp/pvt-dimensioner/requirements.txt
RUN python3 -m pip install -r /tmp/pvt-touchtosort/requirements.txt
RUN mkdir ./build
RUN cmake -B/build -S ./tmp/
RUN cmake --build /build -j 8
WORKDIR /build/
RUN cpack --build -j 4 

ENTRYPOINT ["/bin/bash"]