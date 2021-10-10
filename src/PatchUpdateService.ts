import {DynamoDB} from "aws-sdk";
import PatchRecord, {DynamodbNewImage} from "./PatchRecord";
import CustomerControlRecord from "./CustomerControlRecord";
import CustomerDataRecord from "./CustomerDataRecord";
import EntityTypeTableMapper from "./EntityTypeTableMapper";
import {AttributeMap, UpdateItemInput} from "aws-sdk/clients/dynamodb";
import {jsonStr} from "./app";
import {
    QueryCustomerControlRecordError,
    QueryCustomerDataRecordError,
    UpdateCustomerControlRecordError,
    UpdateCustomerDataRecordError,
    UpdatePatchRecordError
} from "./errors";

export default class PatchUpdateService {
    public constructor(
        private patchRecord: PatchRecord,
        private customerControlRecord: CustomerControlRecord,
        private customerDataRecord: CustomerDataRecord,
        private customerTableName: string,
        private dynamoDB: DynamoDB
    ) {
    }

    static from = (obj: DynamodbNewImage): PatchUpdateService => {
        console.log("start loading patch record")
        const patchRecord = PatchRecord.from(obj)
        const customerControlRecord = CustomerControlRecord.from(patchRecord)
        const customerDataRecord = CustomerDataRecord.from(patchRecord)
        const customerTableName = EntityTypeTableMapper.map.get(patchRecord.entityType)
        const dynamoDb = new DynamoDB()
        const service = new PatchUpdateService(patchRecord, customerControlRecord, customerDataRecord, customerTableName, dynamoDb)
        console.log(`finished loading patch record, customer control record, customer data record: `)
        console.log(patchRecord)
        console.log(customerControlRecord)
        console.log(customerDataRecord)
        return service
    }

    updateCustomerDataRecord = async (): Promise<void> => {
        const params: UpdateItemInput = this.customerDataRecord.getUpdateItemInput(this.customerTableName)
        try {
            await this.dynamoDB.updateItem(params).promise()
        } catch (err) {
            const msg = `Update customer table data record failed, partitionKey: ${this.customerDataRecord.partitionKey}, 
            sortKey: ${this.customerDataRecord.sortKey}, UpdateItemInput: ${jsonStr(params)}, error: ${jsonStr(err)}`
            throw new UpdateCustomerDataRecordError(msg)
        }
    }

    updateCustomerControlRecord = async (): Promise<void> => {
        const params: UpdateItemInput = this.customerControlRecord.getUpdateItemInput(this.customerTableName)
        try {
            await this.dynamoDB.updateItem(params).promise()
        } catch (err) {
            const msg = `Update customer table control record failed, partitionKey: ${this.customerControlRecord.partitionKey}, 
            sortKey: ${this.customerControlRecord.sortKey}, error: ${jsonStr(err)}`
            throw new UpdateCustomerControlRecordError(msg)
        }
    }

    updatePatchRecordAsSuccess = async (): Promise<void> => {
        console.log('update patch record as success')
        this.patchRecord.setPatchUpdated('Success')
        await this.updatePatchRecord()
    }

    updatePatchRecordAsFailed = async (error: string): Promise<void> => {
        console.log('update patch record as failed')
        this.patchRecord.setPatchUpdated('Fail', error)
        await this.updatePatchRecord()
    }

    finish = (): void => {
        console.log(`finished updating patch record: ${this.patchRecord.toString()}`)
    }

    validate = async (): Promise<void> => {
        const dataRecord = await this.queryCustomerDataRecord()
        if (!dataRecord) throw new QueryCustomerDataRecordError('Could not find customer data record, tableName:' +
            `${this.customerTableName}, ${this.customerDataRecord.toString()}`)
        const controlRecord = await this.queryCustomerControlRecord()
        if (!controlRecord) throw new QueryCustomerControlRecordError('Could not find customer control record, tableName:' +
            `${this.customerTableName}, ${this.customerControlRecord.toString()}`)
    }

    private queryCustomerDataRecord = async (): Promise<AttributeMap> => {
        const params = this.customerDataRecord.getGetItemInput(this.customerTableName)
        try {
            const result = await this.dynamoDB.getItem(params).promise()
            return result.Item
        } catch (err) {
            const msg = `Query customer data record failed, table name: ${this.customerTableName}, ${this.customerDataRecord.toString()}, error: ${jsonStr(err)}`
            throw new QueryCustomerDataRecordError(msg)
        }
    }

    private queryCustomerControlRecord = async (): Promise<AttributeMap> => {
        const params = this.customerControlRecord.getGetItemInput(this.customerTableName)
        try {
            const result = await this.dynamoDB.getItem(params).promise()
            return result.Item
        } catch (err) {
            const msg = `Query customer control record failed, table name: ${this.customerTableName}, ${this.customerControlRecord.toString()}, error: ${jsonStr(err)}`
            throw new QueryCustomerControlRecordError(msg)
        }
    }

    private updatePatchRecord = async (): Promise<void> => {
        const params: UpdateItemInput = this.patchRecord.getUpdateItemInput()
        try {
            await this.dynamoDB.updateItem(params).promise()
        } catch (err) {
            const msg = `Update patch update table record failed, ${this.patchRecord.toString()}, UpdateItemInput: ${params}, error: ${jsonStr(err)}`
            throw new UpdatePatchRecordError(msg)
        }
    }
}

