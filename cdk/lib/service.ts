import * as core from '@aws-cdk/core';
import * as apig from '@aws-cdk/aws-apigatewayv2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import { Arn } from '@aws-cdk/core';

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
      integrationUri: this.create_integration_str(this.region, handler.functionArn),
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

  private create_integration_str = (region: string, fn_arn: string): string =>
    `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${fn_arn}/invocations`;
}
