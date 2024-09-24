import {CxCommandOutput} from "../main/wrapper/CxCommandOutput";
import {BaseTest} from "./BaseTest";
import * as fs from "fs";
import CxWrapperFactory from "../main/wrapper/CxWrapperFactory";

describe("Results cases",() => {
    const cxScanConfig = new BaseTest();
    it('Result Test Successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput: CxCommandOutput  = await auth.scanList("statuses=Completed");
        const sampleId  = cxCommandOutput.payload.pop().id;
        
        auth.getResults(sampleId,"json","jsonList", ".").then(() => {
           fileExists("./jsonList.json").then(file => expect(file).toBe(true));
        });
    });

    it('Result Test With Agent Flug Successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput: CxCommandOutput  = await auth.scanList("statuses=Completed");
        const sampleId  = cxCommandOutput.payload.pop().id;
        
        auth.getResults(sampleId,"json","jsonList", ".", "jswrapper").then(() => {
           fileExists("./jsonList.json").then(file => expect(file).toBe(true));
        });
    });

    it('Result List Successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const scanList: CxCommandOutput = await auth.scanList("statuses=Completed");
        let output;
        while (!output && scanList && scanList.payload && scanList.payload.length > 0) {
            const scanId = scanList.payload.pop().id;
            console.log("Triage Successful case -  ScanId " + scanId);
            output = await auth.getResultsList(scanId);
            if (output.status == "Error in the json file.") {
                output = undefined;
            }
        }
        expect(output.status).toBeUndefined();
        expect(output.payload.length).toBeGreaterThanOrEqual(0);
    });

    it('Result summary html file generation successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput: CxCommandOutput = await auth.scanList("statuses=Completed");
        const sampleId  = cxCommandOutput.payload.pop().id;
        await auth.getResults(sampleId,"summaryHTML","test", ".");
        const file = await fileExists("./test.html");
        expect(file).toBe(true);
    });

    it('Result summary html string successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput: CxCommandOutput = await auth.scanList("statuses=Completed");
        const sampleId  = cxCommandOutput.payload.pop().id;
        const written = await auth.getResultsSummary(sampleId);
        expect(written.payload.length).toBeGreaterThan(0);
    });

    it('Result codebashing successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput: CxCommandOutput = await auth.codeBashingList("79","PHP","Reflected XSS All Clients");
        expect(cxCommandOutput.payload.length).toBeGreaterThan(0);
    });
});

const fileExists = (file:string) => {
    return new Promise((resolve) => {
        fs.access(file, fs.constants.F_OK, (err) => {
            err ? resolve(false) : resolve(true)
        });
    })
}