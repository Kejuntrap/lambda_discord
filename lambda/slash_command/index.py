import hashlib
import json
import os
import time

import boto3
from discord_interactions import verify_key, InteractionType, InteractionResponseType
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError
import requests 


def get_parameter(ssm,key):
    response = ssm.get_parameter(
        Name = key,
        WithDecryption=True
    )
    result = response["Parameter"]["Value"]
    return str(result)

def send_sqs(sqs,mes):
    params = {
        'QueueUrl': os.environ.get('SQS_QUEUE_URL'), 
        'MessageBody': json.dumps(mes),
        'MessageGroupId': str(hashlib.md5(str(mes).encode()).hexdigest()),
    }

    try:
        response = sqs.send_message(**params)
        return True
    except Exception as e:
        print("SQS message send failed")
        return False
    
def lambda_handler(event, context):
    request_body = json.loads(event.get("body", "{}"))
    headers = event.get("headers", {})
    ssm = boto3.client("ssm")
    sqs = boto3.client('sqs')
    
    app_id:str = get_parameter(ssm,'/discord_ddargi/APPLICATION_ID')
    bot_token:str = get_parameter(ssm,'/discord_ddargi/BOT_ACCESS_TOKEN')
    pub_key:str = get_parameter(ssm,'/discord_ddargi/PUBLIC_KEY')

    # Verify request
    signature = headers.get("x-signature-ed25519")
    timestamp = headers.get("x-signature-timestamp")
    raw_body = event.get("body", "{}").encode()
    if signature is None or timestamp is None or not verify_key(raw_body, signature, timestamp, pub_key): # Authorization
        return {
            'statusCode': 401,
            'body': "Bad request signature"
        }

    # Handle request
    interaction_type = request_body.get("type")

    if interaction_type in [InteractionType.APPLICATION_COMMAND, InteractionType.MESSAGE_COMPONENT]:
        data = request_body.get("data", {})
        command_name = data.get("name")
        options = data.get("options")
        print(f'{data=}')
        print(f'{request_body=}')

        if command_name == "ddargi":
            sub_command = options[0].get("name")
            if sub_command == "ping":
                response_text = "pong"
            elif sub_command == "chat4":
                value = options[0].get("value")
                mes_gpt = {
                    "message": str(value),
                    "guild_id": str(request_body.get("channel").get("guild_id")),
                    "channel_id": str(request_body.get("channel_id")),
                    "user_id": str(request_body.get("member").get("user").get("id")),
                }
                sqs_res = send_sqs(sqs,mes_gpt)
                response_text = f"SQS send status:{sqs_res}"

        else:
            raise NotImplementedError(f"Command '{command_name}' not implemented")
            response_text = "unexpected command"

        response_data = {
            "type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, 
            "data": {
                "content": response_text,
            },
        }
    else:
        response_data = {"type": InteractionResponseType.PONG}

    return {
        'statusCode': 200,
        'body': json.dumps(response_data)
    }