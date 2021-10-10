import * as _ from 'lodash'
import * as moment from 'moment'
import EntityTypeTableMapper from "./EntityTypeTableMapper";
import {AttributeValue} from "aws-lambda/trigger/dynamodb-stream";
import {InvalidPatchingRecordError, UpdatePatchRecordError} from "./errors";
import {ExpressionAttributeValueMap, UpdateItemInput} from "aws-sdk/clients/dynamodb";

export type DynamodbNewImage = { [key: string]: AttributeValue }

export type PatchUpdateStatus = 'Success' | 'Fail'

export default class PatchRecord {
    public tableName: string

    constructor(
        public partitionKey: string,
        public sorId: string,
        public patchKeyIndex: string,
        public entityType: string,
        public updateData: Map<string, string> = new Map(),
        public patchUpdateStatus?: PatchUpdateStatus,
        public patchUpdatedTime?: string,
        public patchUpdateError?: string) {
        this.tableName = 'cm-ods-dev-customer-patch';
    }

    static from = (obj: DynamodbNewImage): PatchRecord => {
        PatchRecord.validate(obj)
        const patchRecord = new PatchRecord(
            obj.partitionKey.S,
            obj.sorId.S,
            obj.patchKeyIndex.S,
            obj.entityType.S
        )
        Object.entries(obj).forEach(([key, value], index) => {
            if (key !== 'partitionKey' && key !== 'sorId' && key !== 'patchKeyIndex' && key != 'entityType') {
                patchRecord.updateData.set(key, value.S);
            }
        })
        return patchRecord
    }

    static validate(record: DynamodbNewImage): void {
        if (_.isEmpty(record.partitionKey)) throw new InvalidPatchingRecordError("Patching record missing partitionKey")
        if (_.isEmpty(record.sorId)) throw new InvalidPatchingRecordError("Patching record missing sorId")
        if (_.isEmpty(record.patchKeyIndex)) throw new InvalidPatchingRecordError("Patching record missing patchKeyIndex")
        if (_.isEmpty(record.entityType)) throw new InvalidPatchingRecordError("Patching record missing entityType")
        if (!EntityTypeTableMapper.valid(record.entityType.S))
            throw new InvalidPatchingRecordError(`Patching record invalid entityType: (${record.entityType.S})`)
    }

    setPatchUpdated = (status: PatchUpdateStatus, error?: string): void => {
        this.patchUpdateStatus = status
        this.patchUpdatedTime = moment().format()
        this.patchUpdateError = error
    }

    getUpdateItemInput = (): UpdateItemInput => {
        if (this.patchUpdateStatus && this.patchUpdatedTime) {
            const updateExpression = 'set patchUpdateStatus=:x, patchUpdatedTime=:y, patchUpdateError=:z';
            let expressionAttributeValues: ExpressionAttributeValueMap = {};
            expressionAttributeValues[':x'] = {'S': this.patchUpdateStatus}
            expressionAttributeValues[':y'] = {'S': this.patchUpdatedTime}
            expressionAttributeValues[':z'] = {'S': this.patchUpdateError ? this.patchUpdateError : ''}

            return {
                TableName: this.tableName,
                Key: {
                    "partitionKey": {"S": this.partitionKey},
                    "sorId": {"S": this.sorId},
                },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues
            }
        }
        throw new UpdatePatchRecordError("unable to update patch table record, patchUpdateStatus cannot be empty")
    }

    toString = (): string => {
        return `partitionKey: ${this.partitionKey}, sorId: ${this.sorId}, patchKeyIndex: ${this.patchKeyIndex}`
    }
}