import * as _ from 'lodash'
import PatchRecord from "./PatchRecord";
import {
    ExpressionAttributeNameMap,
    ExpressionAttributeValueMap,
    GetItemInput,
    UpdateItemInput
} from "aws-sdk/clients/dynamodb";

export default class CustomerDataRecord {
    public constructor(
        public partitionKey: string,
        public sortKey: string,
        public updateData: Map<string, string>
    ) {
    }

    static from = (patchRecord: PatchRecord): CustomerDataRecord => {
        return new CustomerDataRecord(
            patchRecord.partitionKey,
            patchRecord.sorId,
            patchRecord.updateData
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
        let updateExpression = 'set';
        let expressionAttributeNames: ExpressionAttributeNameMap = {}
        let expressionAttributeValues: ExpressionAttributeValueMap = {};
        this.updateData.forEach((value, key, map) => {
            updateExpression += ` #${key} = :${key} ,`;
            expressionAttributeNames['#' + key] = key;
            expressionAttributeValues[':' + key] = {'S': value};
        })
        if (updateExpression.endsWith(',')) {
            updateExpression = _.trimEnd(updateExpression, ',').trim()
        }
        return {
            TableName: tableName,
            Key: {
                "partitionKey": {"S": this.partitionKey},
                "sortKey": {"S": this.sortKey}
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        }
    }

    toString = (): string => `partitionKey: ${this.partitionKey}, sortKey: ${this.sortKey}`
}