#!/usr/bin/env node
import 'source-map-support/register';
import * as core from 'monocdk';
import { ChatPipelineStack } from '../lib/pipeline';

const app = new core.App();
new ChatPipelineStack(app, 'ChatPipeline', {
  env: {
    account: '092828786384',
    region: 'us-east-2',
  },
});
