const {DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand} = require("@aws-sdk/lib-dynamodb");
const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");

require("dotenv").config();

class DynamoDB {
    #client
    constructor() {
        this.#client = DynamoDBDocumentClient.from(new DynamoDBClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY
            }
        }));
    }

    // Response will have an array of objects
    async executeScanCommand(tableName) {
        return (await this.#client.send(new ScanCommand({TableName: tableName}))).Items;
    }

    // Response will have a key httpStatusCode
    async executePutCommand(tableName, data){
        return (await this.#client.send(new PutCommand({TableName: tableName, Item: data}))).$metadata;
    }

    // Response will have an object if found, or else an object has a key error with the value 'No Data Found'
    async executeGetCommand(tableName, key){
        const response = (await this.#client.send(new GetCommand({TableName: tableName, Key: key})));
        if (response.Item)
            return response.Item;

        return {error: "No data found", tableName: tableName, searchKey: key};
    }
    async executeDeleteCommand(tableName, key){
        return (await this.#client.send(new DeleteCommand({TableName: tableName, Key: key}))).$metadata;
    }
}
module.exports = new DynamoDB();