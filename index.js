const { LambdaClient, UpdateFunctionCodeCommand, PublishVersionCommand } = require("@aws-sdk/client-lambda");
const client = new LambdaClient({ region: process.env.REGION });

exports.handler = async (event) => {
    try {
        const bucket = event.Records[0].s3.bucket.name;
        const object = event.Records[0].s3.object.key;

        if (!object.includes(process.env.FILE_NAME)) {
            console.log("not applicable. object is ", object);
            return { status: 200, result: "not applicable" };
        }

        const updateInput = {
            FunctionName: process.env.FUNCTION_NAME,
            S3Bucket: bucket,
            S3Key: object
        };

        const updateCommand = new UpdateFunctionCodeCommand(updateInput);
        const updateResponse = await client.send(updateCommand);

        console.log("UpdateFunctionCodeCommand status", updateResponse.$metadata.httpStatusCode);
        console.log("UpdateFunctionCodeCommand state", updateResponse.State);

        if (process.env.PUBLISH) {
            const publishInput = {
                FunctionName: process.env.FUNCTION_NAME
            };

            const publishCommand = new PublishVersionCommand(publishInput);
            const publishResponse = await client.send(publishCommand);

            console.log("PublishVersionCommand status", publishResponse.$metadata.httpStatusCode);
            console.log("PublishVersionCommand state", publishResponse.State);

            return { status: publishResponse.$metadata.httpStatusCode, result: "ok", response: publishResponse };
        } else {
            return { status: updateResponse.$metadata.httpStatusCode, result: "ok", response: updateResponse };
        }
    } catch (error) {
        return errorHandler(error);
    }
}

const errorHandler = (error) => {
    const obj = {};
    obj["status"] = 500;
    obj["message"] = error.message;
    obj["stack"] = error.stack;
    obj["result"] = "ng";
    if (error.$metadata) {
        obj["status"] = error.$metadata.httpStatusCode;
    }

    console.log("errorHandler", obj);
    return obj;
}