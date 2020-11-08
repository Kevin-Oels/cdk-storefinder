import * as cdk from '@aws-cdk/core';
import * as store_Service from '../lib/store_Service';

export class CdkstorefinderStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new store_Service.StoreService(this, 'storeservice');
  }
}
