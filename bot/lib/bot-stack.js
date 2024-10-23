"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotStack = void 0;
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const lambda = require("aws-cdk-lib/aws-lambda");
const aws_lambda_python_alpha_1 = require("@aws-cdk/aws-lambda-python-alpha");
const iam = require("aws-cdk-lib/aws-iam"); // IAMポリシーの追加
const sqs = require("aws-cdk-lib/aws-sqs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const lambdaEventSources = require("aws-cdk-lib/aws-lambda-event-sources");
class BotStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const layer = new lambda.LayerVersion(this, 'discordLayer', {
            code: lambda.Code.fromAsset('../package_zip/python.zip'),
            compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
        });
        const queue = new sqs.Queue(this, 'gpt-query-sender', {
            queueName: 'gpt-query-sender.fifo',
            fifo: true, // FIFOキューとして設定
            contentBasedDeduplication: true, // メッセージの内容に基づいて重複排除
            visibilityTimeout: cdk.Duration.seconds(600), // 可視性タイムアウトの時間を設定
        });
        // Lambda関数の作成 (Python)
        const discordIntract = new aws_lambda_python_alpha_1.PythonFunction(this, 'ddargi', {
            runtime: lambda.Runtime.PYTHON_3_12, // Pythonのランタイム
            entry: '../lambda/slash_command', // Lambda関数のコードがあるディレクトリ
            handler: 'lambda_handler', // Lambda関数のハンドラ
            layers: [layer],
            timeout: aws_cdk_lib_1.Duration.seconds(120),
            environment: {
                SQS_QUEUE_URL: queue.queueUrl, // Lambda環境変数にSQSのURLを渡す
            },
        });
        queue.grantSendMessages(discordIntract); // 送信権限
        // Lambda関数の作成 (Python)
        //const chatGPTLayer =  new PythonLayerVersion(this, 'chatGPTLayer', {
        //  entry: '../layers',
        //  compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
        //});
        const chatGPTrequest = new aws_lambda_python_alpha_1.PythonFunction(this, 'putChatGPT', {
            runtime: lambda.Runtime.PYTHON_3_12, // Pythonのランタイム
            entry: '../lambda/chatgpt_sender', // Lambda関数のコードがあるディレクトリ
            handler: 'lambda_handler', // Lambda関数のハンドラ
            layers: [layer],
            timeout: aws_cdk_lib_1.Duration.seconds(300),
        });
        const eventSource = new lambdaEventSources.SqsEventSource(queue); // sqsをトリガにした
        chatGPTrequest.addEventSource(eventSource);
        // Lambdaの実行ロールにSSMポリシーを付与
        discordIntract.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                "ssm:GetParameter", // SSMパラメータを取得する権限
                "ssm:GetParameters", // 複数のSSMパラメータを取得する権限
            ],
            resources: ["arn:aws:ssm:*:*:parameter/*"], // 必要に応じてリソースの制限を調整
        }));
        // Lambdaの実行ロールにKMSポリシーを付与
        discordIntract.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                "kms:Decrypt", // KMSで暗号を復号する権限
                "kms:Encrypt", // KMSでデータを暗号化する権限
                "kms:GenerateDataKey" // KMSデータキーを生成する権限
            ],
            resources: ["arn:aws:kms:*:*:key/*"], // KMSキーのARNを指定 (必要に応じて制限)
        }));
        // Lambdaの実行ロールにSSMポリシーを付与
        chatGPTrequest.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                "ssm:GetParameter", // SSMパラメータを取得する権限
                "ssm:GetParameters", // 複数のSSMパラメータを取得する権限
            ],
            resources: ["arn:aws:ssm:*:*:parameter/*"], // 必要に応じてリソースの制限を調整
        }));
        // Lambdaの実行ロールにKMSポリシーを付与
        chatGPTrequest.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                "kms:Decrypt", // KMSで暗号を復号する権限
                "kms:Encrypt", // KMSでデータを暗号化する権限
                "kms:GenerateDataKey" // KMSデータキーを生成する権限
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
exports.BotStack = BotStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90LXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYm90LXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQyx5REFBeUQ7QUFDekQsaURBQWlEO0FBQ2pELDhFQUFzRjtBQUN0RiwyQ0FBMkMsQ0FBQyxhQUFhO0FBQ3pELDJDQUEyQztBQUMzQyw2Q0FBdUM7QUFDdkMsMkVBQTJFO0FBRTNFLE1BQWEsUUFBUyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3JDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFHeEIsTUFBTSxLQUFLLEdBQUksSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDM0QsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLDJCQUEyQixDQUFDO1lBQ3hELGtCQUFrQixFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDakQsQ0FBQyxDQUFDO1FBRUgsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNwRCxTQUFTLEVBQUUsdUJBQXVCO1lBQ2xDLElBQUksRUFBRSxJQUFJLEVBQUcsZUFBZTtZQUM1Qix5QkFBeUIsRUFBRSxJQUFJLEVBQUUsb0JBQW9CO1lBQ3JELGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFJLGtCQUFrQjtTQUNuRSxDQUFDLENBQUM7UUFFSCx1QkFBdUI7UUFDdkIsTUFBTSxjQUFjLEdBQUcsSUFBSSx3Q0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDeEQsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFHLGVBQWU7WUFD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QXFCO1FBQ3JCLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQy9FLGNBQWMsRUFBRSxLQUFLO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXZHRCw0QkF1R0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7IFB5dGhvbkZ1bmN0aW9uLCBQeXRob25MYXllclZlcnNpb24gfSBmcm9tICdAYXdzLWNkay9hd3MtbGFtYmRhLXB5dGhvbi1hbHBoYSc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7IC8vIElBTeODneODquOCt+ODvOOBrui/veWKoFxuaW1wb3J0ICogYXMgc3FzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zcXMnO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBsYW1iZGFFdmVudFNvdXJjZXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ldmVudC1zb3VyY2VzJztcblxuZXhwb3J0IGNsYXNzIEJvdFN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG5cbiAgICBjb25zdCBsYXllciA9ICBuZXcgbGFtYmRhLkxheWVyVmVyc2lvbih0aGlzLCAnZGlzY29yZExheWVyJywge1xuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9wYWNrYWdlX3ppcC9weXRob24uemlwJyksXG4gICAgICBjb21wYXRpYmxlUnVudGltZXM6IFtsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMl0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBxdWV1ZSA9IG5ldyBzcXMuUXVldWUodGhpcywgJ2dwdC1xdWVyeS1zZW5kZXInLCB7ICAvLyBTUVNcbiAgICAgIHF1ZXVlTmFtZTogJ2dwdC1xdWVyeS1zZW5kZXIuZmlmbycsXG4gICAgICBmaWZvOiB0cnVlLCAgLy8gRklGT+OCreODpeODvOOBqOOBl+OBpuioreWumlxuICAgICAgY29udGVudEJhc2VkRGVkdXBsaWNhdGlvbjogdHJ1ZSwgLy8g44Oh44OD44K744O844K444Gu5YaF5a6544Gr5Z+644Gl44GE44Gm6YeN6KSH5o6S6ZmkXG4gICAgICB2aXNpYmlsaXR5VGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoNjAwKSwgICAvLyDlj6/oppbmgKfjgr/jgqTjg6DjgqLjgqbjg4jjga7mmYLplpPjgpLoqK3lrppcbiAgICB9KTtcblxuICAgIC8vIExhbWJkYemWouaVsOOBruS9nOaIkCAoUHl0aG9uKVxuICAgIGNvbnN0IGRpc2NvcmRJbnRyYWN0ID0gbmV3IFB5dGhvbkZ1bmN0aW9uKHRoaXMsICdkZGFyZ2knLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMiwgIC8vIFB5dGhvbuOBruODqeODs+OCv+OCpOODoFxuICAgICAgZW50cnk6ICcuLi9sYW1iZGEvc2xhc2hfY29tbWFuZCcsICAvLyBMYW1iZGHplqLmlbDjga7jgrPjg7zjg4njgYzjgYLjgovjg4fjgqPjg6zjgq/jg4jjg6pcbiAgICAgIGhhbmRsZXI6ICdsYW1iZGFfaGFuZGxlcicsICAvLyBMYW1iZGHplqLmlbDjga7jg4/jg7Pjg4njg6lcbiAgICAgIGxheWVyczogW2xheWVyXSxcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoMTIwKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFNRU19RVUVVRV9VUkw6IHF1ZXVlLnF1ZXVlVXJsLCAvLyBMYW1iZGHnkrDlooPlpInmlbDjgatTUVPjga5VUkzjgpLmuKHjgZlcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcXVldWUuZ3JhbnRTZW5kTWVzc2FnZXMoZGlzY29yZEludHJhY3QpOyAgLy8g6YCB5L+h5qip6ZmQXG5cbiAgICAvLyBMYW1iZGHplqLmlbDjga7kvZzmiJAgKFB5dGhvbilcblxuICAgIC8vY29uc3QgY2hhdEdQVExheWVyID0gIG5ldyBQeXRob25MYXllclZlcnNpb24odGhpcywgJ2NoYXRHUFRMYXllcicsIHtcbiAgICAvLyAgZW50cnk6ICcuLi9sYXllcnMnLFxuICAgIC8vICBjb21wYXRpYmxlUnVudGltZXM6IFtsYW1iZGEuUnVudGltZS5QWVRIT05fM184XSxcbiAgICAvL30pO1xuXG4gICAgY29uc3QgY2hhdEdQVHJlcXVlc3QgPSBuZXcgUHl0aG9uRnVuY3Rpb24odGhpcywgJ3B1dENoYXRHUFQnLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMiwgIC8vIFB5dGhvbuOBruODqeODs+OCv+OCpOODoFxuICAgICAgZW50cnk6ICcuLi9sYW1iZGEvY2hhdGdwdF9zZW5kZXInLCAgLy8gTGFtYmRh6Zai5pWw44Gu44Kz44O844OJ44GM44GC44KL44OH44Kj44Os44Kv44OI44OqXG4gICAgICBoYW5kbGVyOiAnbGFtYmRhX2hhbmRsZXInLCAgLy8gTGFtYmRh6Zai5pWw44Gu44OP44Oz44OJ44OpXG4gICAgICBsYXllcnM6IFtsYXllcl0sXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDMwMCksXG4gICAgfSk7XG4gICAgY29uc3QgZXZlbnRTb3VyY2UgPSBuZXcgbGFtYmRhRXZlbnRTb3VyY2VzLlNxc0V2ZW50U291cmNlKHF1ZXVlKTsgLy8gc3Fz44KS44OI44Oq44Ks44Gr44GX44GfXG4gICAgY2hhdEdQVHJlcXVlc3QuYWRkRXZlbnRTb3VyY2UoZXZlbnRTb3VyY2UpO1xuXG4gICAgXG5cblxuXG4gICAgICAgIC8vIExhbWJkYeOBruWun+ihjOODreODvOODq+OBq1NTTeODneODquOCt+ODvOOCkuS7mOS4jlxuICAgIGRpc2NvcmRJbnRyYWN0LmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgIFwic3NtOkdldFBhcmFtZXRlclwiLCAgICAgICAgICAgLy8gU1NN44OR44Op44Oh44O844K/44KS5Y+W5b6X44GZ44KL5qip6ZmQXG4gICAgICAgIFwic3NtOkdldFBhcmFtZXRlcnNcIiwgICAgICAgICAgLy8g6KSH5pWw44GuU1NN44OR44Op44Oh44O844K/44KS5Y+W5b6X44GZ44KL5qip6ZmQXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXCJhcm46YXdzOnNzbToqOio6cGFyYW1ldGVyLypcIl0sIC8vIOW/heimgeOBq+W/nOOBmOOBpuODquOCveODvOOCueOBruWItumZkOOCkuiqv+aVtFxuICAgIH0pKTtcblxuICAgIC8vIExhbWJkYeOBruWun+ihjOODreODvOODq+OBq0tNU+ODneODquOCt+ODvOOCkuS7mOS4jlxuICAgIGRpc2NvcmRJbnRyYWN0LmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgIFwia21zOkRlY3J5cHRcIiwgICAgICAgICAgICAgICAgLy8gS01T44Gn5pqX5Y+344KS5b6p5Y+344GZ44KL5qip6ZmQXG4gICAgICAgIFwia21zOkVuY3J5cHRcIiwgICAgICAgICAgICAgICAgLy8gS01T44Gn44OH44O844K/44KS5pqX5Y+35YyW44GZ44KL5qip6ZmQXG4gICAgICAgIFwia21zOkdlbmVyYXRlRGF0YUtleVwiICAgICAgICAgLy8gS01T44OH44O844K/44Kt44O844KS55Sf5oiQ44GZ44KL5qip6ZmQXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbXCJhcm46YXdzOmttczoqOio6a2V5LypcIl0sIC8vIEtNU+OCreODvOOBrkFSTuOCkuaMh+WumiAo5b+F6KaB44Gr5b+c44GY44Gm5Yi26ZmQKVxuICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gTGFtYmRh44Gu5a6f6KGM44Ot44O844Or44GrU1NN44Od44Oq44K344O844KS5LuY5LiOXG4gICAgY2hhdEdQVHJlcXVlc3QuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgXCJzc206R2V0UGFyYW1ldGVyXCIsICAgICAgICAgICAvLyBTU03jg5Hjg6njg6Hjg7zjgr/jgpLlj5blvpfjgZnjgovmqKnpmZBcbiAgICAgICAgXCJzc206R2V0UGFyYW1ldGVyc1wiLCAgICAgICAgICAvLyDopIfmlbDjga5TU03jg5Hjg6njg6Hjg7zjgr/jgpLlj5blvpfjgZnjgovmqKnpmZBcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtcImFybjphd3M6c3NtOio6KjpwYXJhbWV0ZXIvKlwiXSwgLy8g5b+F6KaB44Gr5b+c44GY44Gm44Oq44K944O844K544Gu5Yi26ZmQ44KS6Kq/5pW0XG4gICAgfSkpO1xuXG4gICAgLy8gTGFtYmRh44Gu5a6f6KGM44Ot44O844Or44GrS01T44Od44Oq44K344O844KS5LuY5LiOXG4gICAgY2hhdEdQVHJlcXVlc3QuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgXCJrbXM6RGVjcnlwdFwiLCAgICAgICAgICAgICAgICAvLyBLTVPjgafmmpflj7fjgpLlvqnlj7fjgZnjgovmqKnpmZBcbiAgICAgICAgXCJrbXM6RW5jcnlwdFwiLCAgICAgICAgICAgICAgICAvLyBLTVPjgafjg4fjg7zjgr/jgpLmmpflj7fljJbjgZnjgovmqKnpmZBcbiAgICAgICAgXCJrbXM6R2VuZXJhdGVEYXRhS2V5XCIgICAgICAgICAvLyBLTVPjg4fjg7zjgr/jgq3jg7zjgpLnlJ/miJDjgZnjgovmqKnpmZBcbiAgICAgIF0sXG4gICAgICByZXNvdXJjZXM6IFtcImFybjphd3M6a21zOio6KjprZXkvKlwiXSwgLy8gS01T44Kt44O844GuQVJO44KS5oyH5a6aICjlv4XopoHjgavlv5zjgZjjgabliLbpmZApXG4gICAgfSkpO1xuXG4gICAgLy8gUkVTVCBBUEkgR2F0ZXdheeOBruS9nOaIkFxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ3Jlc0Rpc2NvcmQnLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ3Jlc0Rpc2NvcmQnLFxuICAgICAgZGVzY3JpcHRpb246ICdhcGkgZ2F0ZXdheSBmb3IgZGlzY29yZCcsXG4gICAgfSk7XG5cbiAgICAvLyAvcG9zdCDjg6rjgr3jg7zjgrnjga7kvZzmiJBcbiAgICBjb25zdCBwb3N0UmVzb3VyY2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgncG9zdCcpO1xuXG4gICAgLy8gUE9TVOODoeOCveODg+ODieOBqExhbWJkYeOBrue1seWQiFxuICAgIHBvc3RSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihkaXNjb3JkSW50cmFjdCksIHtcbiAgICAgIGFwaUtleVJlcXVpcmVkOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxufVxuIl19