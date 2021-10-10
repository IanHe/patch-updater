import {DynamoDBStreamEvent} from "aws-lambda/trigger/dynamodb-stream";
import {Callback, Context, Handler} from "aws-lambda/handler";
import PatchUpdateService from "./PatchUpdateService";
import {QueryCustomerControlRecordError, QueryCustomerDataRecordError, UpdateCustomerDataRecordError} from "./errors";

export const lambdaHandler: Handler<DynamoDBStreamEvent, void> = async (
    event: DynamoDBStreamEvent,
    context: Context,
    callback: Callback<void>): Promise<void> => {
    console.log(`Receive ${event.Records.length} records`)
    for (let i = 0; i < event.Records.length; i++) {
        const record = event.Records[i]
        console.log(`process patch stream record index:${i}: `, jsonStr(record));
        if (record.eventName === 'INSERT' && record.dynamodb.NewImage) {
            let patchUpdateService: PatchUpdateService = undefined
            try {
                patchUpdateService = PatchUpdateService.from(record.dynamodb.NewImage)
                await patchUpdateService.validate()
                await patchUpdateService.updateCustomerDataRecord()
                await patchUpdateService.updateCustomerControlRecord()
                await patchUpdateService.updatePatchRecordAsSuccess()
                patchUpdateService.finish()
            } catch (err) {
                if (err instanceof UpdateCustomerDataRecordError
                    || err instanceof UpdateCustomerDataRecordError
                    || err instanceof QueryCustomerDataRecordError
                    || err instanceof QueryCustomerControlRecordError
                ) {
                    console.error(err.message)
                    if (patchUpdateService) {
                        await patchUpdateService.updatePatchRecordAsFailed(err.message)
                    }
                } else {
                    console.error(err.message, err)
                }
            }
        }
    }
    callback(null);
}

export const jsonStr = (obj: any) => JSON.stringify(obj, null, 2)