import * as core from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

export class Service extends core.Stack {
  constructor(scope: core.Construct, id: string, props?: core.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, 'Lambda', {
      code: lambda.Code.fromAsset('../lambda', {
        bundling: {
          image: lambda.Runtime.GO_1_X.bundlingDockerImage,
          command: [
            'sh',
            '-c',
            'export GOBIN=$(go env GOPATH)/bin && go get -t ./... && go test . && go build -o /asset-output/main',
          ],
        },
      }),
      handler: 'main',
      runtime: lambda.Runtime.GO_1_X,
    });
  }
}
