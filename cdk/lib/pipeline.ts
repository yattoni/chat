import * as core from 'monocdk';
import * as codepipeline from 'monocdk/aws-codepipeline';
import * as codepipeline_actions from 'monocdk/aws-codepipeline-actions';
import * as pipelines from 'monocdk/pipelines';
import { Service } from './service';
import { Website } from './website';

export interface ChatApplicationProps extends core.StageProps {
  apiName: string;
}

export class ChatApplication extends core.Stage {
  constructor(scope: core.Construct, id: string, props: ChatApplicationProps) {
    super(scope, id, props);

    new Service(this, 'Service', {
      apiName: props.apiName,
    });

    new Website(this, 'Website');
  }
}

export class ChatPipelineStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props?: core.StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new pipelines.CdkPipeline(this, 'Pipeline', {
      pipelineName: 'ChatPipeline',
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        oauthToken: core.SecretValue.secretsManager('chat-pipeline-github-token'),
        owner: 'yattoni',
        repo: 'chat',
        branch: 'main',
      }),

      synthAction: pipelines.SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        subdirectory: 'cdk',
        installCommand: 'npm install -g aws-cdk && npm install',
        buildCommand: 'npm run build-lambda && npm run build-website',
        synthCommand: 'cdk synth',
      }),
    });

    const chatApp = new ChatApplication(this, 'Prod', {
      env: {
        account: props?.env?.account,
        region: props?.env?.region,
      },
      apiName: 'chat-api',
    });

    pipeline.addApplicationStage(chatApp);
  }
}
