/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_projects_upload_project_files } from '../models/Body_projects_upload_project_files';
import type { ProjectCreate } from '../models/ProjectCreate';
import type { ProjectOut } from '../models/ProjectOut';
import type { ProjectUpdate } from '../models/ProjectUpdate';
import type { UploadResponse } from '../models/UploadResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ProjectsService {

    /**
     * Read All Projects
     * 获取所有项目
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static readAllProjects({
        orderBy = 'modified desc',
    }: {
        orderBy?: string,
    }): CancelablePromise<Array<ProjectOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/projects/',
            query: {
                'order_by': orderBy,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Project
     * 创建新项目
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static createProject({
        requestBody,
    }: {
        requestBody: ProjectCreate,
    }): CancelablePromise<ProjectOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/projects/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Project
     * 获取项目详情
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static getProject({
        projectId,
    }: {
        projectId: number,
    }): CancelablePromise<ProjectOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Project
     * 更新项目
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static updateProject({
        projectId,
        requestBody,
    }: {
        projectId: number,
        requestBody: ProjectUpdate,
    }): CancelablePromise<ProjectOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/projects/{project_id}',
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

    /**
     * Delete Project
     * 删除项目
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteProject({
        projectId,
    }: {
        projectId: number,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Upload Project Files
     * 上传项目文件
     * @returns UploadResponse Successful Response
     * @throws ApiError
     */
    public static uploadProjectFiles({
        projectId,
        formData,
    }: {
        projectId: number,
        formData: Body_projects_upload_project_files,
    }): CancelablePromise<UploadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/projects/{project_id}/upload',
            path: {
                'project_id': projectId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Project Data
     * 获取项目数据
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getProjectData({
        projectId,
        stage,
        category,
    }: {
        projectId: number,
        stage?: (string | null),
        category?: (string | null),
    }): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/projects/{project_id}/data',
            path: {
                'project_id': projectId,
            },
            query: {
                'stage': stage,
                'category': category,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
