import {CxCommandOutput} from "../main/wrapper/CxCommandOutput";
import {BaseTest} from "./BaseTest";
import CxResult from '../main/results/CxResult';
import {CxConstants} from '../main/wrapper/CxConstants';
import CxWrapperFactory from "../main/wrapper/CxWrapperFactory";

describe("Triage cases", () => {
    const cxScanConfig = new BaseTest();

    it('Triage Successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);

        const scanList: CxCommandOutput = await auth.scanList("statuses=Completed,limit=100");
        let result: CxResult;
        let scan, output;
        while (!output && scanList && scanList.payload && scanList.payload.length > 0) {
            scan = scanList.payload.pop()
            console.log("Triage Successful case -  ScanId " + scan.id)
            output = await auth.getResultsList(scan.id)
            if (output.status == "Error in the json file.") {
                output = undefined;
            } else {
                result = output.payload.find(res => res.type == CxConstants.SAST)
                if (!result || !result.similarityId) {
                    output = undefined;
                }
            }
        }

        const cxShow: CxCommandOutput = await auth.triageShow(scan.projectID, result.similarityId, result.type);

        expect(cxShow.exitCode).toEqual(0);

        const cxUpdate: CxCommandOutput = await
            auth.triageUpdate(scan.projectID, result.similarityId, result.type, result.state,
                "Edited via JavascriptWrapper",
                result.severity.toLowerCase() == "high" ? CxConstants.SEVERITY_MEDIUM : CxConstants.SEVERITY_HIGH);

        expect(cxUpdate.exitCode).toEqual(0);
    });
});