import {CxWrapper} from '../main/wrapper/CxWrapper';
import {CxCommandOutput} from "../main/wrapper/CxCommandOutput";
import CxChat from "../main/chat/CxChat";
import {anything, instance, mock, when} from "ts-mockito";
import {BaseTest} from "./BaseTest";
import CxWrapperFactory from "../main/wrapper/CxWrapperFactory";

function createOutput(exitCode:number,payload:CxChat):CxCommandOutput {
    const output = new CxCommandOutput();
    output.exitCode=exitCode;
    output.status="";
    output.payload=[payload];
    return output;
}

describe("Gpt Chat Cases", () => {
    // tests preparation
    const cxScanConfig = new BaseTest();
    const mockedWrapper: CxWrapper = mock(CxWrapper);
    const outputSuccessful = createOutput(0, new CxChat("CONVERSATION", ["RESPONSE"]));

    when(mockedWrapper.kicsChat("APIKEY", "FILE", anything(), anything(), anything(), anything(), anything(), anything())).thenResolve(
        outputSuccessful
    );
    const wrapper: CxWrapper = instance(mockedWrapper);

    it('KICS Gpt Chat Successful case', async () => {
        const cxCommandOutput = await wrapper.kicsChat(
            "APIKEY",
            "FILE",
            0,
            "SEVERITY",
            "VULNERABILITY",
            "INPUT",
            "CONVERSATION",
            "MODEL"
        );
        expect(cxCommandOutput.exitCode).toBe(0);
    });

    it('KICS Gpt Chat Failed case', async () => {
        const originalWrapper: CxWrapper = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput = await originalWrapper.kicsChat(
            "APIKEY",
            "FILE",
            0,
            "SEVERITY",
            "VULNERABILITY",
            "INPUT",
            "",
            "MODEL"
        );
        expect(cxCommandOutput.exitCode).toBe(0);
        expect(cxCommandOutput.payload[0].responses[0]).toBe("It seems that FILE is not available for AI Guided Remediation. Please ensure that you have opened the correct workspace or the relevant file.");
    });

    it('Sast Gpt Chat Failed case', async () => {
        const originalWrapper: CxWrapper = await CxWrapperFactory.createWrapper(cxScanConfig);
        const cxCommandOutput = await originalWrapper.sastChat(
            "APIKEY",
            "SOURCE_FILE",
            "RESULTS_FILE",
            "SEVERITY",
            "VULNERABILITY",
            "INPUT",
        );
        expect(cxCommandOutput.exitCode).toBe(0);
        expect(cxCommandOutput.payload[0].responses[0]).toBe("Invalid conversation ID INPUT");
    });
});