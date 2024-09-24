import {CxCommandOutput} from "../main/wrapper/CxCommandOutput";
import {BaseTest} from "./BaseTest";
import {CxParamType} from "../main/wrapper/CxParamType";
import CxScan from "../main/scan/CxScan";
import CxWrapperFactory from "../main/wrapper/CxWrapperFactory";

describe("ProjectList cases",() => {
    const cxScanConfig = new BaseTest();
    it('ProjectList Successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const data = await auth.projectList("");
        const cxCommandOutput: CxCommandOutput = data;
        expect(cxCommandOutput.payload.length).toBeGreaterThan(0);
    });

    it('ProjectShow Successful case',async () =>{
        const params = new Map();
        params.set(CxParamType.PROJECT_NAME, "ast-cli-javascript-integration-success");
        params.set(CxParamType.S, "./src");
        params.set(CxParamType.FILTER, "*.ts,!**/node_modules/**/*");
        params.set(CxParamType.BRANCH, "master");
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput: CxCommandOutput = await auth.scanCreate(params);
        const scan: CxScan = cxCommandOutput.payload.pop();

        const cxProjectCommandOutput: CxCommandOutput = await auth.projectShow(scan.projectID);
        console.log(" Json object from ProjectShow Successful case: " + JSON.stringify(cxProjectCommandOutput));
        expect(cxProjectCommandOutput.payload.length).toBeGreaterThan(0);
    });

    it('ProjectBranches Successful case',async () =>{
        const params = new Map();
        params.set(CxParamType.PROJECT_NAME, "ast-cli-javascript-integration-success");
        params.set(CxParamType.S, "./src");
        params.set(CxParamType.FILTER, "*.ts,!**/node_modules/**/*");
        params.set(CxParamType.BRANCH, "master");
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput: CxCommandOutput = await auth.scanCreate(params);
        const scan: CxScan = cxCommandOutput.payload.pop();

        const cxProjectCommandOutput: CxCommandOutput = await auth.projectBranches(scan.projectID,"");
        console.log("Json object from projectBranches Successful case: " + JSON.stringify(cxProjectCommandOutput))
        expect(cxProjectCommandOutput.payload.length).toBeGreaterThan(0);
    });
});