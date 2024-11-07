/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DataService {

    /**
     * Read Original Image
     * 获取原始图像
     * @returns any Successful Response
     * @throws ApiError
     */
    public static readOriginalImage({
        dataId,
    }: {
        dataId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/data/{data_id}/image',
            path: {
                'data_id': dataId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Processed Image
     * 获取处理后的图片
     * @returns any Successful Response
     * @throws ApiError
     */
    public static readProcessedImage({
        dataId,
    }: {
        dataId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/data/preprocessed/{data_id}/image',
            path: {
                'data_id': dataId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Processed Data By Stage
     * 获取特定处理阶段的数据
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getProcessedDataByStage({
        workflowExecutionId,
        stage,
        category,
        nodeId,
    }: {
        workflowExecutionId: number,
        stage: string,
        category?: (string | null),
        nodeId?: (string | null),
    }): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/data/workflow/{workflow_execution_id}/{stage}',
            path: {
                'workflow_execution_id': workflowExecutionId,
                'stage': stage,
            },
            query: {
                'category': category,
                'node_id': nodeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Data Metadata
     * 获取数据的元数据
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDataMetadata({
        dataId,
    }: {
        dataId: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/data/metadata/{data_id}',
            path: {
                'data_id': dataId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Project Stage Data
     * 获取项目特定处理阶段的数据
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getProjectStageData({
        projectId,
        stage,
        category,
        workflowExecutionId,
        nodeType,
    }: {
        projectId: number,
        stage: string,
        category?: (string | null),
        workflowExecutionId?: (number | null),
        nodeType?: (string | null),
    }): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/data/project/{project_id}/stage/{stage}',
            path: {
                'project_id': projectId,
                'stage': stage,
            },
            query: {
                'category': category,
                'workflow_execution_id': workflowExecutionId,
                'node_type': nodeType,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Processed Metadata
     * 获取处理后的数据元数据
     * @returns any Successful Response
     * @throws ApiError
     */
    public static readProcessedMetadata({
        dataId,
    }: {
        dataId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/data/preprocessed/{data_id}/metadata',
            path: {
                'data_id': dataId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
