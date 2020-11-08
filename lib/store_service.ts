import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class StoreService extends core.Construct {
    constructor(scope: core.Construct, id: string) {
        super(scope, id);

        // create the dynamodb table we will be reading/writing from
        const listOfStores = new dynamodb.Table(this, 'listOfStores', {
            partitionKey: { name: 'storenumber', type: dynamodb.AttributeType.STRING },
            });

        // define the lambda which will handle fetching and formatting from dynamo on get request
        const handler = new lambda.Function(this, "storeServiceHandler", {
            runtime: lambda.Runtime.NODEJS_12_X, // So we can use async in storefinder.js
            code: lambda.Code.fromAsset("resources"),
            handler: "storefinder.main",
            environment: {
                TABLE: listOfStores.tableName
            }
        });
        
        // give the handler access to the dynamodb table
        listOfStores.grantReadData(handler);
    
        // create the api endpoint
        const api = new apigateway.RestApi(this, "storeservice-api", {
            restApiName: "Store Service",
            description: "This service lists stores."
        });
  
        // describe the lambda integration for the api endpoint
        const getStoresIntegration = new apigateway.LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        });
        
        // apply the lambda integration to the GET method
        api.root.addMethod("GET", getStoresIntegration); // GET /
    }
}