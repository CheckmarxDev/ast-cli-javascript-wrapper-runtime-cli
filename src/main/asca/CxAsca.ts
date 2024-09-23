import AscaScanDetail from "./AscaScanDetail";

export default class CxAsca {
    requestId: string;
    status: boolean;
    message: string;
    scanDetails: AscaScanDetail[];
    error: any;

    constructor() {
        this.requestId = '';
        this.status = false;
        this.message = '';
        this.scanDetails = [];
        this.error = null;
    }

    static parseScan(resultObject: any): CxAsca {
        const scan = new CxAsca();
        scan.requestId = resultObject.request_id;
        scan.status = resultObject.status;
        scan.message = resultObject.message;
        scan.error = resultObject.error;

        if (resultObject.scan_details instanceof Array) {
            scan.scanDetails = resultObject.scan_details.map((detail: any) => {
                const scanDetail = new AscaScanDetail();
                scanDetail.ruleId = detail.rule_id;
                scanDetail.language = detail.language;
                scanDetail.ruleName = detail.rule_name;
                scanDetail.severity = detail.severity;
                scanDetail.fileName = detail.file_name;
                scanDetail.line = detail.line;
                scanDetail.length = detail.length;
                scanDetail.problematicLine = detail.problematicLine;
                scanDetail.remediationAdvise = detail.remediationAdvise;
                scanDetail.description = detail.description;
                return scanDetail;
            });
        }

        return scan;
    }
}
