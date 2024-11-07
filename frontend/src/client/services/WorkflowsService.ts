/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkflowCreate } from '../models/WorkflowCreate';
import type { WorkflowOut } from '../models/WorkflowOut';
import type { WorkflowUpdate } from '../models/WorkflowUpdate';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class WorkflowsService {

    /**
     * Create Workflow
     * @returns WorkflowOut Successful Response
     * @throws ApiError
     */
    public static createWorkflow({
        requestBody,
    }: {
        requestBody: WorkflowCreate,
    }): CancelablePromise<WorkflowOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workflows/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Workflow
     * @returns WorkflowOut Successful Response
     * @throws ApiError
     */
    public static getWorkflow({
        workflowId,
    }: {
        workflowId: number,
    }): CancelablePromise<WorkflowOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workflows/{workflow_id}',
            path: {
                'workflow_id': workflowId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Workflow
     * 更新工作流
     * @returns WorkflowOut Successful Response
     * @throws ApiError
     */
    public static updateWorkflow({
        workflowId,
        requestBody,
    }: {
        workflowId: number,
        requestBody: WorkflowUpdate,
    }): CancelablePromise<WorkflowOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/workflows/{workflow_id}',
            path: {
                'workflow_id': workflowId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Execute Workflow
     * @returns any Successful Response
     * @throws ApiError
     */
    public static executeWorkflow({
        workflowId,
    }: {
        workflowId: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workflows/{workflow_id}/execute',
            path: {
                'workflow_id': workflowId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Execution Status
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getExecutionStatus({
        executionId,
    }: {
        executionId: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workflows/execution/{execution_id}/status',
            path: {
                'execution_id': executionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Execution Stage Data
     * 获取工作流执行特定阶段的数据
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getExecutionStageData({
        executionId,
        stage,
        category,
    }: {
        executionId: number,
        stage: string,
        category?: (string | null),
    }): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workflows/execution/{execution_id}/data/{stage}',
            path: {
                'execution_id': executionId,
                'stage': stage,
            },
            query: {
                'category': category,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Node Data
     * 获取节点处理的数据
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getNodeData({
        nodeExecutionId,
    }: {
        nodeExecutionId: number,
    }): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workflows/node/{node_execution_id}/data',
            path: {
                'node_execution_id': nodeExecutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Execute Single Node
     * 执行单个节点
     * @returns any Successful Response
     * @throws ApiError
     */
    public static executeSingleNode({
        workflowId,
        nodeId,
    }: {
        workflowId: number,
        nodeId: string,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workflows/{workflow_id}/execute_node',
            path: {
                'workflow_id': workflowId,
            },
            query: {
                'node_id': nodeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Execute Workflow Graph
     * 使用 langgraph 执行工作流（支持并行执行）
     * @returns any Successful Response
     * @throws ApiError
     */
    public static executeWorkflowGraph({
        workflowId,
    }: {
        workflowId: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workflows/{workflow_id}/execute_graph',
            path: {
                'workflow_id': workflowId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Node Execution Status
     * 获取节点执行状态
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getNodeExecutionStatus({
        executionId,
        nodeId,
    }: {
        executionId: number,
        nodeId: string,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workflows/execution/{execution_id}/node/{node_id}/status',
            path: {
                'execution_id': executionId,
                'node_id': nodeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Retry Workflow Execution
     * 重试失败的工作流执行
     * @returns any Successful Response
     * @throws ApiError
     */
    public static retryWorkflowExecution({
        executionId,
    }: {
        executionId: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/workflows/execution/{execution_id}/retry',
            path: {
                'execution_id': executionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Project Workflow
     * 获取项目的工作流
     * @returns WorkflowOut Successful Response
     * @throws ApiError
     */
    public static getProjectWorkflow({
        projectId,
    }: {
        projectId: number,
    }): CancelablePromise<WorkflowOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/workflows/project/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
