import json
import os
import time

import boto3
from openai import OpenAI
import requests 

ssm = boto3.client("ssm")


def get_parameter(ssm,key):
    response = ssm.get_parameter(
        Name = key,
        WithDecryption=True
    )
    result = response["Parameter"]["Value"]
    return str(result)


def discord_sender(msg:dict,bot_token:str):
    channel_id = msg.get('channel_id')
    user_id = msg.get('user_id')
    source_content = msg.get("message")
    chatGPT_ans = chatgpt_sender(source_content)

    url_to_send = f"https://discordapp.com/api/channels/{channel_id}/messages"
    header = { "Authorization": f"Bot {bot_token}" }
    response_data = {"content":f"<@{user_id}> chatGPTのお答えだよ。\n質問:{source_content}\n\n回答:{chatGPT_ans}"}
    result = requests.post(url=url_to_send,data=response_data,headers=header)
    print(str(result))


def chatgpt_sender(prompt:str) -> str:
    client = OpenAI(
    # This is the default and can be omitted
        api_key=get_parameter(ssm,'/discord_ddargi/CHATGPT_SECRET'),
    )
    chatgpt_assisstant_setting = get_parameter(ssm,'/discord_ddargi/CHATGPT_ASSISTANT_SETTING')
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": chatgpt_assisstant_setting },  # システムメッセージ
                {"role": "user", "content": prompt }
            ],
            model="gpt-4o",
        )
        # 応答の内容を取得
        print(f"{response=}")
        content = response.choices[0].message.content
        token_t = response.usage.total_tokens
        token_i = response.usage.prompt_tokens
        token_o = response.usage.completion_tokens
        return_string = f'{content}\n\ntoken(s) consumed:{token_t}    i/o:{token_i}/{token_o}\n'
        return return_string
    except Exception as e:
        return f"Error: {e}"

def lambda_handler(event, context):
    request_body = json.loads(event.get("body", "{}"))
    headers = event.get("headers", {})

    bot_token:str = get_parameter(ssm,'/discord_ddargi/BOT_ACCESS_TOKEN')

    msg = json.loads(event['Records'][0]['body'])
    print(msg)

    discord_sender(msg,bot_token)
