/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AnnotationOut = {
    properties: {
        frontend_id: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
        },
        type: {
            type: 'string',
            isRequired: true,
        },
        points: {
            type: 'string',
        },
        color: {
            type: 'string',
        },
        label_id: {
            type: 'number',
            isRequired: true,
        },
        data_id: {
            type: 'number',
            isRequired: true,
        },
        project_id: {
            type: 'number',
            isRequired: true,
        },
        labelme_data: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        processing_stage: {
            type: 'string',
        },
        workflow_execution_id: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
        },
        node_execution_id: {
            type: 'any-of',
            contains: [{
                type: 'number',
            }, {
                type: 'null',
            }],
        },
        annotation_id: {
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
