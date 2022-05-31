import { connection, contract, datasource, tenantInfo, tenantConfiguration, workflow, tag, workflowDesign, permissionItem, connectionSchema, connectionSchemaProperty, user } from "../../nwc";
import { Connection } from "../models/connection";
import { Contract } from "../models/contract";
import { Datasource } from "../models/datasource";
import { WorkflowDesign } from "../models/workflowDesign";
import { Workflow } from "../models/workflow";
import { Tenant } from "../models/tenant";
import { Tag } from "../models/tag";
import { User } from "../models/user";
import { WorkflowPermissionItem } from "../models/workflowPermissionItem";
import { WorkflowPermissions } from "../models/workflowPermissions";
import { ConnectionProperty } from "../models/connectionProperty";
import { ConnectionSchema } from "../models/connectionSchema";
import { Form } from "../models/form";
import { WorkflowHelper } from "./workflowHelper";

export class NwcToSdkModelHelper {
    public static Connection = (connection: connection): Connection => ({
        id: connection.id,
        name: connection.displayName,
        isValid: !(connection.isInvalid ?? false),
        contractId: connection.contractId,
        nwcObject: connection
    })

    public static ConnectionSchema = (schema: connectionSchema): ConnectionSchema => ({
        title: schema.title,
        description: schema.description,
        required: schema.required ?? [],
        type: schema.type,
        properties: Object.assign({}, ...Object.keys(schema.properties).map<{ [key: string]: ConnectionProperty }>((key) => ({
            [key]: {
                title: (schema.properties[key] as connectionSchemaProperty)!.title,
                type: (schema.properties[key] as connectionSchemaProperty)!.type,
                decription: (schema.properties[key] as connectionSchemaProperty)!.description,
                format: (schema.properties[key] as connectionSchemaProperty)!.format,
                value: (schema.properties[key] as connectionSchemaProperty)!.default
            }
        })))
    })

    public static Contract = (contract: contract): Contract => ({
        id: contract.id!,
        name: contract.name!,
        description: contract.description,
        appId: contract.appId
    })

    public static Datasource = (datasource: datasource): Datasource => ({
        id: datasource.id,
        name: datasource.name,
        contractId: datasource.contractId,
        operationId: datasource.operationId,
        connectionId: datasource.connectionId,
        isValid: !datasource.isInvalid,
        definition: datasource.definition ?? ""
    })

    public static Tag = (tag: tag): Tag => ({
        name: tag.name,
        colorIndex: tag.colorIndex,
        count: tag.count
    }
    );

    public static WorkflowDesign = (workflowDesign: workflowDesign): WorkflowDesign => ({
        id: workflowDesign.id!,
        name: workflowDesign.name!,
        engine: workflowDesign.engine,
        tags: workflowDesign.tags!.map((tag) => NwcToSdkModelHelper.Tag(tag)),
        businessOwners: workflowDesign.businessOwners.map<WorkflowPermissionItem>((item) => NwcToSdkModelHelper.WorkflowPermissionItem(item)),
        formUrl: workflowDesign.published?.urls?.formUrl ?? workflowDesign.draft?.urls?.formUrl
    });

    public static Tenant = (tenantInfo: tenantInfo, tenantConfiguration: tenantConfiguration): Tenant => ({
        id: tenantInfo.id!,
        name: tenantInfo.name!,
        apiManagerUrl: tenantConfiguration.apiManagerUrl!,
        serviceRegion: tenantConfiguration.serviceRegion!,
        host: tenantConfiguration.apiManagerUrl!.split('//')[1],
        url: tenantInfo.tenancy_url!
    });

    public static WorkflowPermissionItem = (item: permissionItem): WorkflowPermissionItem => ({
        id: item.id,
        name: item.name,
        type: item.type,
        email: item.subtext
    })

    public static WorkflowPermissions = (workflowOwners: permissionItem[], businessOwners: permissionItem[]): WorkflowPermissions => ({
        workflowOwners: workflowOwners.map<WorkflowPermissionItem>((item) => NwcToSdkModelHelper.WorkflowPermissionItem(item)),
        businessOwners: businessOwners.map<WorkflowPermissionItem>((item) => NwcToSdkModelHelper.WorkflowPermissionItem(item))
    })

    public static Workflow = (workflow: workflow, design: WorkflowDesign): Workflow => {
        const definition = WorkflowHelper.parseDefinition(workflow.workflowDefinition)
        const forms = WorkflowHelper.forms(definition, workflow.startEvents)
        const dependencies = WorkflowHelper.dependencies(definition, forms)
        return ({
            id: workflow.workflowId,
            name: workflow.workflowName,
            info: {
                engine: workflow.engineName,
                eventType: workflow.eventType,
                tags: workflow.tags!.map((tag) => NwcToSdkModelHelper.Tag(tag)),
                isActive: workflow.isActive === undefined ? false : workflow.isActive,
                isPublished: workflow.isPublished === undefined ? false : workflow.isPublished,
                publishedId: workflow.publishedId,
                status: workflow.status,
                version: workflow.version,
                description: workflow.workflowDescription,
                designVersion: workflow.workflowDesignVersion,
                type: workflow.workflowType,
                comments: workflow.workflowVersionComments,
                author: NwcToSdkModelHelper.User(workflow.author!)
            },
            startEvents: workflow.startEvents,
            permissions: {
                businessOwners: design.businessOwners,
                workflowOwners: (workflow.permissions) ? workflow.permissions.map<WorkflowPermissionItem>((item) => NwcToSdkModelHelper.WorkflowPermissionItem(item)) : []
            },
            dependencies: dependencies,
            forms: forms,
            definition: definition,
            startFormUrl: design.formUrl
        });
    }

    public static User = (user: user): User => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? user.first_name,
        lastName: user.lastName ?? user.last_name,
        roles: user.roles,
        name: user.name ?? user.displayName
    })
}
