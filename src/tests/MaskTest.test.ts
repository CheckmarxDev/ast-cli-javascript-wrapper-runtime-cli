import {CxCommandOutput} from "../main/wrapper/CxCommandOutput";
import {BaseTest} from "./BaseTest";
import CxWrapperFactory from "../main/wrapper/CxWrapperFactory";

describe("Mask cases",() => {
    const cxScanConfig = new BaseTest();
    it('Mask Successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const data = await auth.maskSecrets("dist/tests/data/package.json")
        const cxCommandOutput: CxCommandOutput = data;
        expect(cxCommandOutput.payload.length).toEqual(1);
    });

});