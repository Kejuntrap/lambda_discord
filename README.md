# lambda_discord

https://blog.shikoan.com/discord-bot-lambda-1/

が参考になる。

## パッケージの追加

```
docker run --rm -it -v $(pwd):/layer python:3.12 /bin/bash
```

を使って、Linux 環境を作成し、そこで Python3.12 の環境を作成してパッケージをインストールした。
ただし、cffi だけはバージョンを 1.16.0 にするのがよい。
毎回イメージが消されるので適当に venv を作るといいかもしれない

```
cffi==1.16.0
requests
discord_interactions
openai
```

をインストールした。boto3 は Lambda 環境ですでに入っているので Lambda を手元で試すなどしない限りはいらない。

```
pip freeze > requirements.txt
pip install -r requirements.txt -t python/
```

ダウンロードできないときはサーバーを変えると良い

```
-i https://pypi.tuna.tsinghua.edu.cn/simple
```

zip にするには

```
apt update && apt install -y zip
zip -r9 python.zip python/
```

## cdk

deploy は `cdk deploy` するだけ
