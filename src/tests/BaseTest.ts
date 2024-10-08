export class BaseTest {
    baseUri: string;
    baseAuthUri: string;
    clientId: string;
    clientSecret: string;
    apiKey: string;
    scanId: string;
    pathToExecutable: string;
    tenant: string;
    additionalParameters:string;

    constructor() {
        this.baseUri = process.env["CX_BASE_URI"];
        this.baseAuthUri = process.env["CX_BASE_AUTH_URI"];
        this.clientId = process.env["CX_CLIENT_ID"];
        this.clientSecret = process.env["CX_CLIENT_SECRET"];
        this.tenant = process.env["CX_TENANT"];
        this.apiKey = process.env["CX_APIKEY"];
        this.additionalParameters = "--debug"
    }
}