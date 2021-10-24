import PatchRecord from "../PatchRecord";
import * as moment from "moment";
import CustomerDataRecord from "../CustomerDataRecord";
import * as AWS from "aws-sdk";
import {DynamoDB} from "aws-sdk";
import {GetItemInput} from "aws-sdk/clients/dynamodb";
import {PutItemInput} from "aws-sdk/clients/dynamodb";

describe('test', () => {
    AWS.config.update({
        region: 'ap-southeast-2'
    })
    const dynamodb = new DynamoDB();
    test('something', async () => {
        const patchRecord = PatchRecord.from({
            partitionKey: {"S": "somepartitionKey"},
            sorId: {"S": "somesorId"},
            patchKeyIndex: {"S": "somepatchKeyIndex"},
            entityType: {"S": "CIND"},
            startDate: {"S": "someStartDate"}
        })
        const now = moment().format()
        // console.log(now)

        const customerDataRecord = CustomerDataRecord.from(patchRecord)

        const params = customerDataRecord.getUpdateItemInput("someTableName")

        // console.log(customerDataRecord)
        console.log(params)
    })
    test('insert Customer Control Records & Data Records', async () => {
        // generate control records and data records
        const customerTableName = 'customer-dev-individual'

        for (let i = 0; i < 5; i++) {
            const controlRecordInput: PutItemInput = {
                TableName: customerTableName,
                Item: {
                    partitionKey: {'S': `${i}-somePartitionKey`},
                    sortKey: {'S': `${i}-sortKey#Latest`},
                    version: {'S': `${i}-v1`},
                    info: {'S': `${i}-info-control`},
                    additionalInfo: {'S': `${i}-additionalInfo-control`},
                }
            }

            const dataRecordInput: PutItemInput = {
                TableName: customerTableName,
                Item: {
                    partitionKey: {'S': `${i}-somePartitionKey`},
                    sortKey: {'S': `${i}-sortKey#V1#1`},
                    info: {'S': `${i}-info-data`},
                    additionalInfo: {'S': `${i}-additionalInfo-data`},
                }
            }
            await dynamodb.putItem(controlRecordInput).promise()
            await dynamodb.putItem(dataRecordInput).promise()
        }
    })
    test('insert Patch Table Data Records', async () => {
        // generate patching table records
        const patchTableName = 'cm-ods-dev-customer-patch'
        for (let i = 0; i < 5; i++) {
            //insert patch record
            const patchRecordInput: PutItemInput = {
                TableName: patchTableName,
                Item: {
                    partitionKey: {'S': `${i}-somePartitionKey`},
                    sorId: {'S': `${i}-sortKey#V1#1`},
                    patchKeyIndex: {'S': `${i}-patchKeyIndex`},
                    entityType: {'S': 'CIND'},
                    startDate: {'S': `${i}-update-startDate`},
                    birthDay: {'S': `${i}-update-bod`}
                }
            }

            await dynamodb.putItem(patchRecordInput).promise()
        }
    })
})