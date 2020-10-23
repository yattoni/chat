import * as core from 'monocdk';
import * as apig from 'monocdk/aws-apigatewayv2';
import * as lambda from 'monocdk/aws-lambda';
import * as iam from 'monocdk/aws-iam';

export interface ServiceProps extends core.StackProps {
  apiName: string;
}

export class Service extends core.Stack {
  constructor(scope: core.Construct, id: string, props: ServiceProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, 'Lambda', {
      code: lambda.Code.fromAsset('../lambda', {
        bundling: {
          image: lambda.Runtime.GO_1_X.bundlingDockerImage,
          command: ['sh', '-c', 'go test && go build -o /asset-output/main'],
        },
      }),
      handler: 'main',
      runtime: lambda.Runtime.GO_1_X,
    });

    const api = new apig.CfnApi(this, 'Api', {
      name: props.apiName,
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.action',
    });

    const apigExecutionRole = new iam.Role(this, 'ApiRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        ApiGatewayExecute: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['lambda:InvokeFunction'],
              resources: [
                this.formatArn({
                  service: 'lambda',
                  resource: 'function',
                  sep: ':',
                  resourceName: handler.functionName,
                }),
              ],
            }),
          ],
        }),
      },
    });

    handler.addPermission('ApiLambdaPermission', {
      action: 'lambda:InvokeFunction',
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: apigExecutionRole.roleArn,
    });

    const connectIntegration = new apig.CfnIntegration(this, 'ConnectIntegration', {
      apiId: api.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: this.createLambdaIntegrationStr(handler),
      credentialsArn: apigExecutionRole.roleArn,
    });

    const connectRoute = new apig.CfnRoute(this, 'ConnectRoute', {
      apiId: api.ref,
      routeKey: '$connect',
      authorizationType: 'NONE',
      target: 'integrations/' + connectIntegration.ref,
    });

    const deployment = new apig.CfnDeployment(this, 'Deployment', {
      apiId: api.ref,
    });

    const stage = new apig.CfnStage(this, 'Stage', {
      apiId: api.ref,
      autoDeploy: true,
      deploymentId: deployment.ref,
      stageName: 'prod',
    });

    const deploymentDependencies = new core.ConcreteDependable();
    deploymentDependencies.add(connectRoute);
    deployment.node.addDependency(deploymentDependencies);
  }

  private createLambdaIntegrationStr = (func: lambda.IFunction): string =>
    this.formatArn({
      service: 'apigateway',
      account: 'lambda',
      resource: 'path/2015-03-31/functions',
      sep: '/',
      resourceName: `${func.functionArn}/invocations`,
    });
}
