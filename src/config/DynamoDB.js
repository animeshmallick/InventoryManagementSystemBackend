const {DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand} = require("@aws-sdk/lib-dynamodb");
const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");

require("dotenv").config();

class DynamoDB {
    #client
    constructor() {
        this.#client = DynamoDBDocumentClient.from(
            new DynamoDBClient({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY,
                    secretAccessKey: process.env.AWS_SECRET_KEY,
                }
            }));
    }


    async scanCommand(tableName) {
        return (await this.#client.send(new ScanCommand({TableName: tableName}))).Items;
    }

    async putCommand(tableName, data){
        try {
            return (await this.#client.send(new PutCommand({TableName: tableName, Item: data})));
        }catch (err){
            throw err;
        }
    }
}
module.exports = new DynamoDB();