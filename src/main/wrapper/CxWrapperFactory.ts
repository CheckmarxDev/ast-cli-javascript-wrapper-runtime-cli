import {CxWrapper} from "./CxWrapper";
import {CxConfig} from "./CxConfig";

class CxWrapperFactory {
    static async createWrapper(cxScanConfig: CxConfig, type?: string, logFilePath?: string) {
        let wrapper: CxWrapper;

        if (type === 'mock') {
            wrapper = new CxWrapper(cxScanConfig, logFilePath);
        }
        else {
            wrapper = await CxWrapper.getInstance(cxScanConfig, logFilePath);
        }
        await wrapper.init();
        return wrapper;
    }
}

export default CxWrapperFactory;