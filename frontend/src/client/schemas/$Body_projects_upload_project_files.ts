/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Body_projects_upload_project_files = {
    properties: {
        files: {
            type: 'array',
            contains: {
                type: 'binary',
                format: 'binary',
            },
            isRequired: true,
        },
    },
} as const;
