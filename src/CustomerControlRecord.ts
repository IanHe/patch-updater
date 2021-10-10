import PatchRecord from "./PatchRecord";
import {ExpressionAttributeValueMap, GetItemInput, UpdateItemInput} from "aws-sdk/clients/dynamodb";

export default class CustomerControlRecord {
    public constructor(
        public partitionKey: string,
        public sortKey: string,
        public patchKeyIndex: string,
        public messageSource: string = "PATCH"
    ) {
    }

    static from = (patchRecord: PatchRecord): CustomerControlRecord => {
        const sortKey = CustomerControlRecord.getSortKey(patchRecord.sorId)
        return new CustomerControlRecord(
            patchRecord.partitionKey,
            sortKey,
            patchRecord.patchKeyIndex
        )
    }

    getGetItemInput = (tableName: string): GetItemInput => {
        return {
            TableName: tableName,
            Key: {
                "partitionKey": {"S": this.partitionKey},
                "sortKey": {"S": this.sortKey}
            }
        }
    }

    getUpdateItemInput = (tableName: string): UpdateItemInput => {
        const updateExpression = 'set patchKeyIndex=:x, messageSource=:y';
        let expressionAttributeValues: ExpressionAttributeValueMap = {};
        expressionAttributeValues[':x'] = {'S': this.patchKeyIndex}
        expressionAttributeValues[':y'] = {'S': this.messageSource}

        return {
            TableName: tableName,
            Key: {
                "partitionKey": {"S": this.partitionKey},
                "sortKey": {"S": this.sortKey},
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues
        }
    }

    toString = (): string => `partitionKey: ${this.partitionKey}, sortKey: ${this.sortKey}`

    private static getSortKey = (sorId: string): string => {
        const arr = sorId.split("#")
        return `${arr[0]}#Latest`
    }
}