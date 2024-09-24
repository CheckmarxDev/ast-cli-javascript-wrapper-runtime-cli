import {BaseTest} from "./BaseTest";
import {CxCommandOutput} from "../main/wrapper/CxCommandOutput";
import CxKicsRemediation from "../main/remediation/CxKicsRemediation";
import CxWrapperFactory from "../main/wrapper/CxWrapperFactory";

describe("SCA Remediation cases",() => {
    const cxScanConfig = new BaseTest();
    it('SCA Remediation Successful case ', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const e:CxCommandOutput = await auth.scaRemediation("dist/tests/data/package.json","copyfiles","1.2")
        expect(e.exitCode).toBe(0);
    });
});

describe("Kics Remediation cases",() => {
    const cxScanConfig = new BaseTest();
    it('Kics Remediation Successful case', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const e:[Promise<CxCommandOutput>,any] = await auth.kicsRemediation("dist/tests/data/results.json",__dirname+"/data","docker")
        const output = await e[0];
        const remediation: CxKicsRemediation = output.payload[0];
        expect(remediation.availableRemediation).toBeDefined();
        expect(remediation.appliedRemediation).toBeDefined();
    });

    it('Kics Remediation Successful case with filter', async () => {
        const auth = await CxWrapperFactory.createWrapper(cxScanConfig);
        const e:[Promise<CxCommandOutput>,any] = await auth.kicsRemediation("dist/tests/data/results.json",__dirname+"/data/","","9574288c118e8c87eea31b6f0b011295a39ec5e70d83fb70e839b8db4a99eba8")
        const output = await e[0];
        const remediation: CxKicsRemediation = output.payload[0];
        expect(remediation.availableRemediation).toBeDefined();
        expect(remediation.appliedRemediation).toBeDefined();
    });
});