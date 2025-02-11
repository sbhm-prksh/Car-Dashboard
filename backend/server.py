import asyncio
import websockets
import json
import random
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

async def send_sensor_data(websocket):
    try:
        logging.info("New client connected")
        while True:
            # Simulated sensor data| please replace it with original data
            data = {
                "speed": random.randint(0, 140), #use sensor data
                "rpm": random.randint(0, 6000),#use sensor data
                "battery": random.randint(60, 100)#use sensor data
            }
            await websocket.send(json.dumps(data))
            await asyncio.sleep(1)  # Send data every 1s
    except websockets.exceptions.ConnectionClosed:
        logging.info("Client disconnected")

async def main():
    logging.info("Starting server...")
    async with websockets.serve(send_sensor_data, "localhost", 8765):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())