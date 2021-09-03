const { LambdaClient, UpdateFunctionCodeCommand, PublishVersionCommand } = require("@aws-sdk/client-lambda");
const client = new LambdaClient({ region: process.env.REGION });

exports.handler = async (event) => {
    try {
        const bucket = event.Records[0].s3.bucket.name;
        const updateInput = {
            FunctionName: process.env.FUNCTION_NAME,
            S3Bucket: bucket,
            S3Key: process.env.FILE_NAME
        };
        const publishInput = {
            FunctionName: process.env.FUNCTION_NAME
        };

        const updateCommand = new UpdateFunctionCodeCommand(updateInput);
        const updateResponse = await client.send(updateCommand);
        console.log("UpdateFunctionCodeCommand status", updateResponse.$metadata.httpStatusCode);
        console.log("state", updateResponse.State);

        if (process.env.PUBLISH) {
            const publishCommand = new PublishVersionCommand(publishInput);
            const publishResponse = await client.send(publishCommand);
            console.log("PublishVersionCommand status", publishResponse.$metadata.httpStatusCode);
            console.log("state", publishResponse.State);
            return { status: publishResponse.$metadata.httpStatusCode, result: "ok", response: publishResponse }
        } else return { status: updateResponse.$metadata.httpStatusCode, result: "ok", response: updateResponse }
    } catch (error) {
        return errorHandler(error);
    }
}

const errorHandler = (error) => {
    const obj = {};
    if (error.response) {
        obj["status"] = error.response.status;
        obj["statusText"] = error.response.statusText;
        obj["data"] = error.response.data;
    }
    obj["message"] = error.message;
    obj["result"] = "ng";

    console.log("errorHandler", obj);
    return obj;
}