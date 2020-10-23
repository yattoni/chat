#!/usr/bin/env node
import 'source-map-support/register';
import * as core from 'monocdk';
import { ChatPipelineStack, ChatApplication } from '../lib/pipeline';

const app = new core.App();
new ChatPipelineStack(app, 'ChatPipeline', {
  env: {
    account: '092828786384',
    region: 'us-east-2',
  },
});

new ChatApplication(app, 'Dev', {
  env: {
    account: '092828786384',
    region: 'us-east-2',
  },
  apiName: 'dev-chat-api',
});
