const { LambdaClient, UpdateFunctionCodeCommand } = require("@aws-sdk/client-lambda");
const client = new LambdaClient({ region: process.env.REGION });

exports.handler = async (event) => {
    try {
        const bucket = event.Records[0].s3.bucket.name;
        const input = {
            FunctionName: process.env.FUNCTION_NAME,
            S3Bucket: bucket,
            S3Key: process.env.FILE_NAME
        };

        const command = new UpdateFunctionCodeCommand(input);
        const response = await client.send(command);

        console.log("status", response.$metadata.httpStatusCode);
        console.log("state", response.State);

        return { status: response.$metadata.httpStatusCode, result: "ok", response }
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