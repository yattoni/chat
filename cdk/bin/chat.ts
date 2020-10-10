#!/usr/bin/env node
import 'source-map-support/register';
import * as core from '@aws-cdk/core';
import { ChatPipelineStack } from '../lib/pipeline';

const app = new core.App();
new ChatPipelineStack(app, 'ChatPipeline', {
    env: {
        account: '092828786384',
        region: 'us-east-2'
    }
})
