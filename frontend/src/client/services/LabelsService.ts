/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LabelCreate } from '../models/LabelCreate';
import type { LabelOut } from '../models/LabelOut';
import type { LabelUpdate } from '../models/LabelUpdate';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LabelsService {

    /**
     * Read All Labels
     * 获取所有标签
     * @returns LabelOut Successful Response
     * @throws ApiError
     */
    public static readAllLabels(): CancelablePromise<Array<LabelOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/labels/',
        });
    }

    /**
     * Create Label
     * 创建新标签
     * @returns LabelOut Successful Response
     * @throws ApiError
     */
    public static createLabel({
        requestBody,
        removeDuplicateByName = false,
    }: {
        requestBody: LabelCreate,
        removeDuplicateByName?: boolean,
    }): CancelablePromise<LabelOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/labels/',
            headers: {
                'remove-duplicate-by-name': removeDuplicateByName,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Label
     * 获取标签详情
     * @returns LabelOut Successful Response
     * @throws ApiError
     */
    public static readLabel({
        labelId,
    }: {
        labelId: number,
    }): CancelablePromise<LabelOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/labels/{label_id}',
            path: {
                'label_id': labelId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Label
     * 更新标签
     * @returns LabelOut Successful Response
     * @throws ApiError
     */
    public static updateLabel({
        labelId,
        requestBody,
    }: {
        labelId: number,
        requestBody: LabelUpdate,
    }): CancelablePromise<LabelOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/labels/{label_id}',
            path: {
                'label_id': labelId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Label
     * 删除标签
     * @returns LabelOut Successful Response
     * @throws ApiError
     */
    public static deleteLabel({
        labelId,
    }: {
        labelId: number,
    }): CancelablePromise<LabelOut> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/labels/{label_id}',
            path: {
                'label_id': labelId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Labels By Project
     * 获取项目的所有标签
     * @returns LabelOut Successful Response
     * @throws ApiError
     */
    public static readLabelsByProject({
        projectId,
    }: {
        projectId: number,
    }): CancelablePromise<Array<LabelOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/labels/project/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Project Labels
     * 删除项目的所有标签
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteProjectLabels({
        projectId,
    }: {
        projectId: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/labels/project/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Batch Create Project Labels
     * 批量创建项目标签
     * @returns LabelOut Successful Response
     * @throws ApiError
     */
    public static batchCreateProjectLabels({
        projectId,
        requestBody,
    }: {
        projectId: number,
        requestBody: Array<LabelCreate>,
    }): CancelablePromise<Array<LabelOut>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/labels/project/{project_id}/batch',
            path: {
                'project_id': projectId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
