export default class AscaScanDetail {
    ruleId: number;
    language: string;
    ruleName: string;
    severity: string;
    fileName: string;
    line: number;
    length: number;
    problematicLine: string;
    remediationAdvise: string;
    description: string;

    constructor() {
        this.ruleId = 0;
        this.language = '';
        this.ruleName = '';
        this.severity = '';
        this.fileName = '';
        this.line = 0;
        this.length = 0;
        this.problematicLine = '';
        this.remediationAdvise = '';
        this.description = '';
    }
}
