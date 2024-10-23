#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BotStack } from '../lib/bot-stack';

const app = new cdk.App();
new BotStack(app, 'BotStack', {
  env: { account: '533266980557', region: 'us-east-1' },

});