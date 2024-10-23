"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotStack = void 0;
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const lambda = require("aws-cdk-lib/aws-lambda");
const aws_lambda_python_alpha_1 = require("@aws-cdk/aws-lambda-python-alpha");
class BotStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const layer = new aws_lambda_python_alpha_1.PythonLayerVersion(this, 'discordLayer', {
            entry: '../layers',
            compatibleRuntimes: [lambda.Runtime.PYTHON_3_11],
        });
        // Lambda関数の作成 (Python)
        const discordIntract = new aws_lambda_python_alpha_1.PythonFunction(this, 'ddargi', {
            runtime: lambda.Runtime.PYTHON_3_11, // Pythonのランタイム
            entry: '../lambda', // Lambda関数のコードがあるディレクトリ
            handler: 'lambda_handler', // Lambda関数のハンドラ
            layers: [layer]
        });
        // REST API Gatewayの作成
        const api = new apigateway.RestApi(this, 'resDiscord', {
            restApiName: 'resDiscord',
            description: '',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90LXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYm90LXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQyx5REFBeUQ7QUFDekQsaURBQWlEO0FBQ2pELDhFQUFzRjtBQUV0RixNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNyQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBR3hCLE1BQU0sS0FBSyxHQUFJLElBQUksNENBQWtCLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUMxRCxLQUFLLEVBQUUsV0FBVztZQUNsQixrQkFBa0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQ2pELENBQUMsQ0FBQztRQUVILHVCQUF1QjtRQUN2QixNQUFNLGNBQWMsR0FBRyxJQUFJLHdDQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUN4RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUcsZUFBZTtZQUNyRCxLQUFLLEVBQUUsV0FBVyxFQUFHLHdCQUF3QjtZQUM3QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUcsZ0JBQWdCO1lBQzVDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztTQUNoQixDQUFDLENBQUM7UUFFSCxzQkFBc0I7UUFDdEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDckQsV0FBVyxFQUFFLFlBQVk7WUFDekIsV0FBVyxFQUFFLEVBQUU7U0FDaEIsQ0FBQyxDQUFDO1FBRUgsZ0JBQWdCO1FBQ2hCLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWxELHFCQUFxQjtRQUNyQixZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUMvRSxjQUFjLEVBQUUsS0FBSztTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFoQ0QsNEJBZ0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBQeXRob25GdW5jdGlvbiwgUHl0aG9uTGF5ZXJWZXJzaW9uIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWxhbWJkYS1weXRob24tYWxwaGEnO1xuXG5leHBvcnQgY2xhc3MgQm90U3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cblxuICAgIGNvbnN0IGxheWVyID0gIG5ldyBQeXRob25MYXllclZlcnNpb24odGhpcywgJ2Rpc2NvcmRMYXllcicsIHtcbiAgICAgIGVudHJ5OiAnLi4vbGF5ZXJzJyxcbiAgICAgIGNvbXBhdGlibGVSdW50aW1lczogW2xhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExXSxcbiAgICB9KTtcblxuICAgIC8vIExhbWJkYemWouaVsOOBruS9nOaIkCAoUHl0aG9uKVxuICAgIGNvbnN0IGRpc2NvcmRJbnRyYWN0ID0gbmV3IFB5dGhvbkZ1bmN0aW9uKHRoaXMsICdkZGFyZ2knLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSwgIC8vIFB5dGhvbuOBruODqeODs+OCv+OCpOODoFxuICAgICAgZW50cnk6ICcuLi9sYW1iZGEnLCAgLy8gTGFtYmRh6Zai5pWw44Gu44Kz44O844OJ44GM44GC44KL44OH44Kj44Os44Kv44OI44OqXG4gICAgICBoYW5kbGVyOiAnbGFtYmRhX2hhbmRsZXInLCAgLy8gTGFtYmRh6Zai5pWw44Gu44OP44Oz44OJ44OpXG4gICAgICBsYXllcnM6IFtsYXllcl1cbiAgICB9KTtcblxuICAgIC8vIFJFU1QgQVBJIEdhdGV3YXnjga7kvZzmiJBcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdyZXNEaXNjb3JkJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdyZXNEaXNjb3JkJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICB9KTtcblxuICAgIC8vIC9wb3N0IOODquOCveODvOOCueOBruS9nOaIkFxuICAgIGNvbnN0IHBvc3RSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdwb3N0Jyk7XG5cbiAgICAvLyBQT1NU44Oh44K944OD44OJ44GoTGFtYmRh44Gu57Wx5ZCIXG4gICAgcG9zdFJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGRpc2NvcmRJbnRyYWN0KSwge1xuICAgICAgYXBpS2V5UmVxdWlyZWQ6IGZhbHNlLFxuICAgIH0pO1xuICB9XG59XG4iXX0=