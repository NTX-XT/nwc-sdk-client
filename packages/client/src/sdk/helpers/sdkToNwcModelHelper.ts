import { permissionItem, tag, user, connection, publishWorkflowPayload, updateWorkflowPayload, workflowDatasources } from "../../nwc";
import { Connection } from "../models/connection";
import { DatasourceDependency } from "../models/datasourceDependency";
import { Tag } from "../models/tag";
import { User } from "../models/user";
import { Workflow } from "../models/workflow";
import { WorkflowPermissionItem } from "../models/workflowPermissionItem";
import { WorkflowHelper } from "./workflowHelper";

export class SdkToNwcModelHelper {
    public static tag = (tag: Tag): tag => (
        {
            name: tag.name,
            count: tag.count,
            colorIndex: tag.colorIndex
        }
    );

    public static permissionItem = (permission: WorkflowPermissionItem): permissionItem => ({
        id: permission.id,
        name: permission.name,
        type: permission.type
    })

    public static updateWorkflowPayload = (workflow: Workflow): updateWorkflowPayload => ({
        workflowName: workflow.name,
        workflowDescription: workflow.info.description,
        workflowType: workflow.definition.settings.type,
        workflowDefinition: JSON.stringify(workflow.definition),
        author: workflow.info.author,
        startEvents: workflow.startEvents,
        datasources: JSON.stringify(SdkToNwcModelHelper.datasources(WorkflowHelper.allDatasourceDependencies(workflow.dependencies))),
        permissions: workflow.permissions.workflowOwners,
        businessOwners: workflow.permissions.businessOwners,
        workflowVersionComments: workflow.info.comments,
        workflowDesignParentVersion: workflow.info.designVersion,
        tags: workflow.info.tags,
        engineName: workflow.info.engine,
        version: workflow.info.version
    })

    public static datasources = (dependencies: DatasourceDependency[]): workflowDatasources => {
        const datasources: workflowDatasources = {}

        for (const dependency of dependencies) {
            for (const formId of dependency.formIds) {
                if (!datasources[formId]) {
                    datasources[formId] = {
                        sources: [],
                        type: formId === "startForm" ? formId : "taskForm"
                    }
                }
                const existingId = datasources[formId].sources.find(ds => ds.id === formId)
                if (!existingId)
                    datasources[formId].sources.push({ id: formId })
            }
        }
        return datasources
    }
    // public static user = (user: User) : user => ({
    //     id: user.id,
    //     displayName: user.name ?? "",


    // })
    // public static workflowSource = (worklflow: Workflow): workflow => ({
    //     author: worklflow._nwcObject.author,
    //     created: worklflow._nwcObject.created,
    //     creator: worklflow._nwcObject.creator,
    //     datasources: worklflow._nwcObject.datasources,
    //     engineName: worklflow.engine!,
    //     eventConfiguration: worklflow._nwcObject.eventConfiguration,
    //     eventType: worklflow.eventType,
    //     hasPermissions: worklflow._nwcObject.hasPermissions,
    //     isActive: worklflow.isActive,
    //     isDeleted: worklflow._nwcObject.isDeleted,
    //     isLatest: worklflow._nwcObject.isLatest,
    //     isPublished: worklflow.isPublished,
    //     lastEdited: worklflow._nwcObject.lastEdited,
    //     lastModified: worklflow._nwcObject.lastModified,
    //     lastPublished: worklflow._nwcObject.lastPublished,
    //     latestId: worklflow._nwcObject.latestId,
    //     permissions: worklflow._nwcObject.permissions,
    //     publishAuthor: worklflow._nwcObject.publishAuthor,
    //     publishRequestedBy: worklflow._nwcObject.publishRequestedBy,
    //     publishedId: worklflow.publishedId,
    //     startEvents: worklflow._nwcObject.startEvents,
    //     status: worklflow.status!,
    //     tags: worklflow.tags.map((tag) => NwcModelBuilder.tag(tag)),
    //     version: worklflow.version!,
    //     workflowDescription: worklflow.description,
    //     workflowDefinition: "",
    //     workflowDesignVersion: worklflow.designVersion,
    //     workflowId: worklflow.id,
    //     workflowName: worklflow.name,
    //     workflowType: worklflow.type!,
    //     workflowVersionComments: worklflow.comments
    // });
}
