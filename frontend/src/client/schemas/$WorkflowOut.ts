/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $WorkflowOut = {
    properties: {
        name: {
            type: 'string',
            isRequired: true,
        },
        description: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        config: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
        },
        workflow_id: {
            type: 'number',
            isRequired: true,
        },
        project_id: {
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
