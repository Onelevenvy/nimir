/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $UploadResponse = {
    description: `Upload response schema`,
    properties: {
        message: {
            type: 'string',
            isRequired: true,
        },
        uploaded_files: {
            type: 'array',
            contains: {
                type: 'string',
            },
            isRequired: true,
        },
    },
} as const;
