from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from bson import json_util
import asyncio
from aiohttp import web
import concurrent.futures
import time
import pandas
import json
import socket
import datetime
import aiohttp_cors
import websockets
import random
import datetime

custom_connection_string = "mongodb://172.20.0.2:27017"

class mdbserver(object):
    def __init__(self, connection_string= "mongodb://localhost:27017"):
        self.CONNECTION_STRING = connection_string
        self.mongo_client = None
        self.is_connected = None
        self.loop = asyncio.get_event_loop()
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        self.loop.run_in_executor(self.executor, self.blocking_connect_)

    def blocking_connect_(self):
        self.mongo_client = MongoClient(self.CONNECTION_STRING)
        try: 
            self.mongo_client.admin.command('ping')
            print("connected to mongodb server on: ", self.CONNECTION_STRING, "")
            self.is_connected = True
        except:
            print("mongdb server not available on: ", self.CONNECTION_STRING)
            self.is_connected = False
        self.check_connection()

    def check_connection(self):
        return self.loop.run_in_executor(self.executor, self.check_connection_)
    
    def check_connection_(self):
        while True:
            time.sleep(5)
            if self.is_connected:
                try:
                    self.mongo_client.admin.command('ismaster')
                except ConnectionFailure:
                    print("mongdb server not available on: ", self.CONNECTION_STRING)
                    self.is_connected = False
                    self.loop.run_in_executor(self.executor, self.blocking_connect_)
            else:
                self.loop.run_in_executor(self.executor, self.blocking_connect_)

    def get_db(self, db_name):
        return self.mongo_client[db_name]

    def get_collection(self, db_name, collection_name):
        return self.get_db(db_name)[collection_name]

class qb_websocket_server():
    def __init__(self, ip, port):
        self.ip = ip
        self.port = port
        self.ws = None
        self.loop = asyncio.get_event_loop()
        self.loop.create_task(self.serve())
        self.CLIENTS = set()

    async def serve(self):
        websocket = await websockets.serve(self.ws_handler, self.ip, self.port)
        self.ws = websocket
        print("serve qb websocket on {}:{}".format(self.ip, self.port))
        await asyncio.Future()

    async def ws_handler(self, websocket, path):
        self.CLIENTS.add(websocket)
        async for msg in websocket:
            print(msg)
            for ws in self.CLIENTS.copy():
                try:
                    await ws.send(msg)
                except websockets.ConnectionClosed:
                    self.CLIENTS.remove(ws)
                    print("client disconnected")
            

class qb_websocket_client():
    def __init__(self, ip, port, callback):
        self.ip = ip
        self.port = port
        self.ws = None
        self.read_callback = callback
        self.loop = asyncio.get_event_loop()
        self.loop.create_task(self.connect())
    
    async def connect(self):
        await asyncio.sleep(3)
        print("connecting to qb websocket on {}:{}".format(self.ip, self.port))
        async with websockets.connect("ws://{}:{}/ws".format(self.ip, self.port)) as websocket:
            if websocket.open:
                print("connected to qb websocket on {}:{}".format(self.ip, self.port))
                self.ws = websocket
                await self.ws_handler(websocket)
            else:
                print("failed to connect to qb websocket on {}:{}".format(self.ip, self.port))
                await asyncio.sleep(1)
                self.loop.create_task(self.connect())
    
    def ws_writer(self, msg):
        print("sending: ", msg)
        self.loop.create_task(self.ws_writer_(msg))

    async def ws_writer_(self, msg):
        if self.ws:
            await self.ws.send(msg)
        else:
            print("no qb websocket connection")

    async def ws_handler(self, websocket):
        async for msg in websocket:
            self.loop.create_task(self.read_callback(msg))

class qblogic_sim():
    def __init__(self, ip_addr, port):
        self.ip = ip_addr
        self.port = port
        self.loop = asyncio.get_event_loop()
        self.app = web.Application()

        self.app.router.add_get('/sort-start-timestamp', self.sort_start_timestamp)
        self.setup_cors()

        self.runner = web.AppRunner(self.app)
        self.site = None
        self.loop.create_task(self.setup())
        self.df = pandas.DataFrame()
        self.show_text = ""

    def setup_cors(self):
        cors = aiohttp_cors.setup(self.app, defaults={
                "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
        })

        cors_config = {
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
        }
        for route in list(self.app.router.routes()):
            cors.add(route, cors_config)
    
    async def setup(self):
        await self.runner.setup()
        self.site = web.TCPSite(self.runner, self.ip, self.port)
        await self.site.start()
    
    async def start(self):
        await self.site.start()
    
    async def stop(self):
        await self.runner.cleanup()

    async def setdirection_handle(self, request):
        data = await request.json()
        print(data)
        return web.Response(text="200")

    async def sort_start_timestamp(self, request):
        response = json_util.dumps({"time":0.0})
        return web.Response(text=response)

    def run(self):
        # blocking call
        web.run_app(self.app)



class qbds_sim():
    def __init__(self, ip_addr, port):
        self.ip = ip_addr
        self.port = port
        self.loop = asyncio.get_event_loop()
        self.app = web.Application()

        self.app.router.add_post('/set_direction', self.setdirection_handle)
        self.app.router.add_get('/cellmap', self.cellmap_handle)
        self.setup_cors()

        self.qbws = qb_websocket_client("0.0.0.0", 5556, self.qbws_callback)

        self.runner = web.AppRunner(self.app)
        self.site = None
        self.loop.create_task(self.setup())
        self.loop.create_task(self.update_robot())
        self.df = pandas.DataFrame()
        self.show_text = ""
        self.robot_id = 0

    async def qbws_callback(self, msg):
        pass
    
    def setup_cors(self):
        cors = aiohttp_cors.setup(self.app, defaults={
                "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
        })

        cors_config = {
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
        }
        for route in list(self.app.router.routes()):
            cors.add(route, cors_config)
    
    async def send200(self, request):
        return web.Response(text="200")
    
    async def setup(self):
        await self.runner.setup()
        self.site = web.TCPSite(self.runner, self.ip, self.port)
        await self.site.start()
    
    async def start(self):
        await self.site.start()
    
    async def stop(self):
        await self.runner.cleanup()

    async def update_robot(self):
        if self.qbws.ws is None:
            print("qb websocket disconnected")
        else:
            self.robot_id = "{:04d}".format(random.randint(1,120))
            await self.qbws.ws_writer_(json_util.dumps({
                "description":{"problem":"","solution":"","title":"Current Robot"},
                "show":True,"time":datetime.datetime.now(),
                "topic":"/qb/ds/current_robot_update",
                "value": {
                    "extra":{"current_robot": self.robot_id, "cell_id": "/input_gate_1/node_1"}},
            }))
        await asyncio.sleep(5)
        await self.update_robot()

    async def gen_msg(self, direction):
        if self.qbws.ws is None:
            print("qb websocket disconnected")
        else:
            await self.qbws.ws_writer_(json_util.dumps({
                "description":{"problem":"","solution":"","title":"update_parcel_queue"},
                "show":True,"time":datetime.datetime.now(),
                "topic":"/qb/ds/update_parcel_queue",
                "value": {
                    "extra":{"direction": direction, "cell_id": "/input_gate_1/node_1"}},
            }))
            await asyncio.sleep(2)
            await self.qbws.ws_writer_(json_util.dumps({
                "description":{"problem":"","solution":"","title":"piece_to_output"},
                "topic":"/qb/ds/piece_to_output",
                "value":{
                    "extra":{"robot_id": self.robot_id, "direction": direction, "input_cell": "/input_gate_1/node_1"}},
            }))
        return
    
    async def setdirection_handle(self, request):
        data = await request.json() 
        print(data)
        self.loop.create_task(self.gen_msg(data['direction']))
        return web.Response(text="200")

    async def cellmap_handle(self, request):
        response = str({"/input_gate_1/node_1":"0","/input_gate_1/node_2":"1"})
        response = json_util.dumps({
            "/input_gate_1/node_1":"0",
            "/input_gate_1/node_2":"1"
        })
        return web.Response(text=response)

    def run(self):
        # blocking call
        web.run_app(self.app)


class webserver():
    def __init__(self, ip_addr, port, mongo_connection_string):
        self.ip = ip_addr
        self.port = port
        self.mongo_connection_string = mongo_connection_string
        self.mongo_client = mdbserver(self.mongo_connection_string)
        self.loop = asyncio.get_event_loop()
        self.app = web.Application()

        self.app.router.add_get('/floorplan', self.floorplan_handle)
        self.app.router.add_get('/sortplan', self.sortplan_handle)

        self.setup_cors()

        self.runner = web.AppRunner(self.app)
        self.site = None
        self.loop.create_task(self.setup())
        self.df = pandas.DataFrame()
        self.show_text = ""

    def setup_cors(self):
        cors = aiohttp_cors.setup(self.app, defaults={
                "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
        })

        cors_config = {
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
        }
        for route in list(self.app.router.routes()):
            cors.add(route, cors_config)
    
    async def send200(self, request):
        return web.Response(text="200")
    
    async def setup(self):
        await self.runner.setup()
        self.site = web.TCPSite(self.runner, self.ip, self.port)
        await self.site.start()
    
    async def start(self):
        await self.site.start()
    
    async def stop(self):
        await self.runner.cleanup()

    async def floorplan_handle(self, request):
        if self.mongo_client.is_connected:
            collection = self.mongo_client.get_collection("qb_data", "floorplan")
            cursor = collection.find({}, {"_id":0, "data":1}).sort("_id", -1).limit(1)
            response = str(list(cursor)[0]['data'])
        else:
            response = "no connection"
        return web.Response(text=response)

    async def sortplan_handle(self, request):
        if self.mongo_client.is_connected:
            collection = self.mongo_client.get_collection("qb_data", "sortplan")
            cursor = collection.find({}, {"_id":0, "data":1}).sort("_id", -1).limit(1)
            
            response = str(list(cursor)[0]['data'])
        else:
            response = "no connection"
        return web.Response(text=response)
    
    def run(self):
        # blocking call
        web.run_app(self.app)

class application():
    def __init__(self, ip, path_to_floorplan, path_to_sortplan):
        self.ip = ip
        self.mongo_connection_string = custom_connection_string
        
        self.mongo_client = mdbserver(self.mongo_connection_string)

        self.qbws_server = qb_websocket_server("0.0.0.0", 5556)

        self.write_file(path_to_floorplan, path_to_sortplan)

        self.wbserver = webserver(self.ip, 6002, self.mongo_connection_string)
        self.qbds_server = qbds_sim(self.ip, 2002)
        self.qblogic_server = qblogic_sim(self.ip, 6019)
        
        self.loop = asyncio.get_event_loop()
    
    def read_file(self, path):
        with open(path, 'r') as f:
            return json.load(f)

    def write_file(self, path_to_floorplan, path_to_sortplan):
        floorplan = self.read_file(path_to_floorplan)
        sortplan = self.read_file(path_to_sortplan)

        while(1):
            if self.mongo_client.is_connected:
                break
            else:
                time.sleep(1)

        collection = self.mongo_client.get_collection("qb_data", "floorplan")
        collection.insert_one({"timestamp": datetime.datetime.now(), "data": json_util.dumps(floorplan)})
        collection = self.mongo_client.get_collection("qb_data", "sortplan")
        collection.insert_one({"timestamp": datetime.datetime.now(), "data": json_util.dumps(sortplan)})


    def run(self):
        self.loop.run_forever()

if __name__ == "__main__":
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    app = application(ip=ip_address, path_to_floorplan="/usr/src/floorplan.json", path_to_sortplan="/usr/src/sortplan.json")
    
    print("starting server on ip: ", ip_address, " and port: ", 6002)
    app.run()
