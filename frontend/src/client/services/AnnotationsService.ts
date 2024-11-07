/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AnnotationCreate } from '../models/AnnotationCreate';
import type { AnnotationOut } from '../models/AnnotationOut';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AnnotationsService {

    /**
     * Read Annotations By Data
     * 获取某个数据的标注
     * @returns AnnotationOut Successful Response
     * @throws ApiError
     */
    public static readAnnotationsByData({
        dataId,
    }: {
        dataId: number,
    }): CancelablePromise<Array<AnnotationOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/annotations/data/{data_id}',
            path: {
                'data_id': dataId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Data Annotations
     * 更新数据的标注
     * @returns AnnotationOut Successful Response
     * @throws ApiError
     */
    public static updateDataAnnotations({
        dataId,
        processingStage,
        requestBody,
        workflowExecutionId,
        nodeExecutionId,
    }: {
        dataId: number,
        /**
         * 处理阶段
         */
        processingStage: string,
        requestBody: Array<AnnotationCreate>,
        workflowExecutionId?: (number | null),
        nodeExecutionId?: (number | null),
    }): CancelablePromise<Array<AnnotationOut>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/annotations/data/{data_id}',
            path: {
                'data_id': dataId,
            },
            query: {
                'processing_stage': processingStage,
                'workflow_execution_id': workflowExecutionId,
                'node_execution_id': nodeExecutionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Data Annotations
     * 删除数据的所有标注
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteDataAnnotations({
        dataId,
    }: {
        dataId: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/annotations/data/{data_id}',
            path: {
                'data_id': dataId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Annotations By Workflow Node
     * 获取工作流特定节点的数据标注
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAnnotationsByWorkflowNode({
        workflowExecutionId,
        nodeId,
        category,
    }: {
        workflowExecutionId: number,
        nodeId: string,
        category?: (string | null),
    }): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/annotations/workflow/{workflow_execution_id}/{node_id}',
            path: {
                'workflow_execution_id': workflowExecutionId,
                'node_id': nodeId,
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
     * Get Annotations By Stage
     * 获取项目特定处理阶段的标注
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAnnotationsByStage({
        projectId,
        stage,
        workflowExecutionId,
        category,
    }: {
        projectId: number,
        stage: string,
        workflowExecutionId?: (number | null),
        category?: (string | null),
    }): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/annotations/project/{project_id}/stage/{stage}',
            path: {
                'project_id': projectId,
                'stage': stage,
            },
            query: {
                'workflow_execution_id': workflowExecutionId,
                'category': category,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
