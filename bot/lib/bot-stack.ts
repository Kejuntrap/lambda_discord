import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { PythonFunction, PythonLayerVersion } from '@aws-cdk/aws-lambda-python-alpha';
import * as iam from 'aws-cdk-lib/aws-iam'; // IAMポリシーの追加
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';

export class BotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const layer =  new lambda.LayerVersion(this, 'discordLayer', {
      code: lambda.Code.fromAsset('../po/python.zip'),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
    });

    const queue = new sqs.Queue(this, 'gpt-query-sender', {  // SQS
      queueName: 'gpt-query-sender.fifo',
      fifo: true,  // FIFOキューとして設定
      contentBasedDeduplication: true, // メッセージの内容に基づいて重複排除
      visibilityTimeout: cdk.Duration.seconds(600),   // 可視性タイムアウトの時間を設定
    });

    // Lambda関数の作成 (Python)
    const discordIntract = new PythonFunction(this, 'ddargi', {
      runtime: lambda.Runtime.PYTHON_3_12,  // Pythonのランタイム
      entry: '../lambda/slash_command',  // Lambda関数のコードがあるディレクトリ
      handler: 'lambda_handler',  // Lambda関数のハンドラ
      layers: [layer],
      timeout: Duration.seconds(120),
      environment: {
        SQS_QUEUE_URL: queue.queueUrl, // Lambda環境変数にSQSのURLを渡す
      },
    });
    queue.grantSendMessages(discordIntract);  // 送信権限

    // Lambda関数の作成 (Python)

    //const chatGPTLayer =  new PythonLayerVersion(this, 'chatGPTLayer', {
    //  entry: '../layers',
    //  compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
    //});

    const chatGPTrequest = new PythonFunction(this, 'putChatGPT', {
      runtime: lambda.Runtime.PYTHON_3_12,  // Pythonのランタイム
      entry: '../lambda/chatgpt_sender',  // Lambda関数のコードがあるディレクトリ
      handler: 'lambda_handler',  // Lambda関数のハンドラ
      layers: [layer],
      timeout: Duration.seconds(300),
    });
    const eventSource = new lambdaEventSources.SqsEventSource(queue); // sqsをトリガにした
    chatGPTrequest.addEventSource(eventSource);

    



        // Lambdaの実行ロールにSSMポリシーを付与
    discordIntract.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "ssm:GetParameter",           // SSMパラメータを取得する権限
        "ssm:GetParameters",          // 複数のSSMパラメータを取得する権限
      ],
      resources: ["arn:aws:ssm:*:*:parameter/*"], // 必要に応じてリソースの制限を調整
    }));

    // Lambdaの実行ロールにKMSポリシーを付与
    discordIntract.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "kms:Decrypt",                // KMSで暗号を復号する権限
        "kms:Encrypt",                // KMSでデータを暗号化する権限
        "kms:GenerateDataKey"         // KMSデータキーを生成する権限
      ],
      resources: ["arn:aws:kms:*:*:key/*"], // KMSキーのARNを指定 (必要に応じて制限)
    }));

            // Lambdaの実行ロールにSSMポリシーを付与
    chatGPTrequest.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "ssm:GetParameter",           // SSMパラメータを取得する権限
        "ssm:GetParameters",          // 複数のSSMパラメータを取得する権限
      ],
      resources: ["arn:aws:ssm:*:*:parameter/*"], // 必要に応じてリソースの制限を調整
    }));

    // Lambdaの実行ロールにKMSポリシーを付与
    chatGPTrequest.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "kms:Decrypt",                // KMSで暗号を復号する権限
        "kms:Encrypt",                // KMSでデータを暗号化する権限
        "kms:GenerateDataKey"         // KMSデータキーを生成する権限
      ],
      resources: ["arn:aws:kms:*:*:key/*"], // KMSキーのARNを指定 (必要に応じて制限)
    }));

    // REST API Gatewayの作成
    const api = new apigateway.RestApi(this, 'resDiscord', {
      restApiName: 'resDiscord',
      description: 'api gateway for discord',
    });

    // /post リソースの作成
    const postResource = api.root.addResource('post');

    // POSTメソッドとLambdaの統合
    postResource.addMethod('POST', new apigateway.LambdaIntegration(discordIntract), {
      apiKeyRequired: false,
    });
  }
}
