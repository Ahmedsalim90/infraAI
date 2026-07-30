import socketio
import threading
import time

SERVER_URL = "http://localhost:5000"

client1 = socketio.Client()
client2 = socketio.Client()


@client1.event
def connect():
    print("✅ Client 1 Connected")


@client2.event
def connect():
    print("✅ Client 2 Connected")


@client1.on("design_updated")
def design_updated(data):
    print("\n🟢 Client 1 Received Design Update")
    print(data)


@client2.on("design_updated")
def design_updated(data):
    print("\n🟢 Client 2 Received Design Update")
    print(data)


@client1.on("conflict")
def conflict(data):
    print("\n❌ Client 1 Conflict")
    print(data)


@client2.on("conflict")
def conflict(data):
    print("\n❌ Client 2 Conflict")
    print(data)


def simulate_client_1():

    client1.connect(SERVER_URL)

    client1.emit(
        "join_project",
        {
            "username": "Kayla",
            "project_id": "infra123"
        }
    )

    time.sleep(2)

    client1.emit(
        "design_update",
        {
            "project_id": "infra123",
            "version": 0,
            "design": {
                "nodes": [
                    {
                        "id": "1",
                        "label": "React App"
                    }
                ]
            }
        }
    )


def simulate_client_2():

    client2.connect(SERVER_URL)

    client2.emit(
        "join_project",
        {
            "username": "Salim",
            "project_id": "infra123"
        }
    )

    time.sleep(2)

    client2.emit(
        "design_update",
        {
            "project_id": "infra123",
            "version": 0,
            "design": {
                "nodes": [
                    {
                        "id": "2",
                        "label": "Flask API"
                    }
                ]
            }
        }
    )


thread1 = threading.Thread(target=simulate_client_1)
thread2 = threading.Thread(target=simulate_client_2)

thread1.start()
thread2.start()

thread1.join()
thread2.join()

time.sleep(5)

client1.disconnect()
client2.disconnect()
