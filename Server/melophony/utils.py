
import os
import json

def get_server_configuration():
    server_dir = os.path.dirname(os.path.dirname(__file__))
    with open(os.path.join(server_dir, "configuration", "configuration.json"), "r") as configuration_file:
        content = configuration_file.read()
        return json.loads(content)


def get_configuration(key, default=None):
    try:
        configuration = get_server_configuration()
        return configuration.get(key, default)
    except:
        return default