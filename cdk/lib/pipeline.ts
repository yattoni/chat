import * as core from "@aws-cdk/core";
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as pipelines from "@aws-cdk/pipelines";
import { ChatStack } from "./chat-stack";


class ChatApplication extends core.Stage {
    constructor(scope: core.Construct, id: string, props?: core.StageProps) {
        super(scope, id, props);

        const chat = new ChatStack(this, 'Chat');
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
                branch: 'main'
            }),

            synthAction: pipelines.SimpleSynthAction.standardNpmSynth({
                sourceArtifact,
                cloudAssemblyArtifact,
                subdirectory: 'cdk',
                installCommand: 'npm install -g aws-cdk && npm install',
                synthCommand: 'cdk synth',
            })
        });

        const chatApp = new ChatApplication(this, 'Prod', {
            env: {
                account: props?.env?.account,
                region: props?.env?.region
            }
        })
    
        pipeline.addApplicationStage(chatApp);
    }
}
