import { FormRow } from "./formRow";
import { FormVariable } from "./formVariable"

export interface Form {
    id: string;
    name: string;
    ruleGroups: any[];
    theme: any;
    pageSettings: any;
    version: number;
    formType: string;
    contract: {
        version: number;
        variablePrefix: string;
    };
    variableContext: {
        variables: FormVariable[],
        version: number
    };
    rows: FormRow[];
    settings: any;
    submissionConfig?: any;
    dataSourceContext?: {
        [key: string]: { id: string }
    }
}
