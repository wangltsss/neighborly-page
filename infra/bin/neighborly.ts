#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { neighborlyConfig } from '../lib/config';
import { NeighborlyStack } from '../lib/neighborly-stack';

const app = new cdk.App();

new NeighborlyStack(app, 'NeighborlyStack', {
  env: {
    account: neighborlyConfig.awsAccountId,
    region: neighborlyConfig.awsRegion,
  },
  description: 'Neighborly community platform infrastructure',
});

app.synth();
