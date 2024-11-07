/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $LabelOut = {
    properties: {
        project_id: {
            type: 'number',
            isRequired: true,
        },
        name: {
            type: 'string',
            isRequired: true,
        },
        color: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        comment: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        super_category_id: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
        },
        label_id: {
            type: 'number',
            isRequired: true,
        },
        created: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        modified: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
    },
} as const;
