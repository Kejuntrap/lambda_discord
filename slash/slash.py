import requests
import os
from os.path import join, dirname
import json
from dotenv import load_dotenv

load_dotenv(verbose=True)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

commands = {
    "name": "ddargi",
    "description": "commands of bot",
    "options": [
        {
            "name": "ping",
            "description": "ping",
            "type": 3,
            "required": False,
            "choices": [
                {"name": "ping", "value": "check health"},
            ],
        },
        {
            "name": "chat4",
            "description": "message",
            "type": 3,
            "required": False,
            "value":"chatGPTに投げるコンテンツ"
        },
    ],
}

def main():
    url = f"https://discord.com/api/v10/applications/{os.environ.get('APPLICATION_ID')}/commands"
    headers = {
        "Authorization": f'Bot {os.environ.get("BOT_ACCESS_TOKEN")}',
        "Content-Type": "application/json",
    }
    res = requests.post(url, headers=headers, data=json.dumps(commands))
    print(res.content)

if __name__ == "__main__":
    main()