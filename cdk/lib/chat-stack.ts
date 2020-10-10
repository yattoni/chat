import * as core from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';

export class ChatStack extends core.Stack {

  constructor(scope: core.Construct, id: string, props?: core.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new s3.Bucket(this, 'Bucket', {
      removalPolicy: core.RemovalPolicy.DESTROY
    });

    new lambda.Function(this, 'Lambda', {
      code: lambda.Code.fromAsset('../lambda', {
        bundling: {
          image: lambda.Runtime.GO_1_X.bundlingDockerImage,
          command: [
            'sh',
            '-c',
            'export GOBIN=$(go env GOPATH)/bin && go get -t ./... && go test . && go build -o /asset-output/main'
          ]
        }
      }),
      handler: 'main',
      runtime: lambda.Runtime.GO_1_X
    })
  }
}
