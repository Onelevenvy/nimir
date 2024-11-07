/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $WorkflowCreate = {
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
        project_id: {
            type: 'number',
            isRequired: true,
        },
    },
} as const;
