import {CxCommandOutput} from "../main/wrapper/CxCommandOutput";
import {CxConfig} from "../main/wrapper/CxConfig";
import {BaseTest} from "./BaseTest";
import CxWrapperFactory from "../main/wrapper/CxWrapperFactory";

describe("Authentication validation",() => {
    const cxScanConfig = new BaseTest();
    it('Result authentication successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput: CxCommandOutput = await auth.authValidate();
        expect(cxCommandOutput.exitCode).toBe(0);
    });

    it('Result authentication failed case', async () => {
        const cxScanConfig_fail = new CxConfig();
        cxScanConfig_fail.baseUri = "error";
        cxScanConfig_fail.clientId = "error";
        cxScanConfig_fail.clientSecret = "error";
        cxScanConfig_fail.tenant = process.env["CX_TENANT"];
        cxScanConfig_fail.apiKey = "error";
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig_fail,'mock');
        const cxCommandOutput: CxCommandOutput = await auth.authValidate();
        expect(cxCommandOutput.exitCode).toBe(1);
    });
});