// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { AnyAction } from 'redux';
import i18n from 'i18next';

import { ServerError, RequestError, StorageLocation } from 'cvat-core-wrapper';
import { AuthActionTypes } from 'actions/auth-actions';
import { FormatsActionTypes } from 'actions/formats-actions';
import { ModelsActionTypes } from 'actions/models-actions';
import { TasksActionTypes } from 'actions/tasks-actions';
import { ProjectsActionTypes } from 'actions/projects-actions';
import { AboutActionTypes } from 'actions/about-actions';
import { AnnotationActionTypes } from 'actions/annotation-actions';
import { NotificationsActionType } from 'actions/notification-actions';
import { BoundariesActionTypes } from 'actions/boundaries-actions';
import { UserAgreementsActionTypes } from 'actions/useragreements-actions';
import { ReviewActionTypes } from 'actions/review-actions';
import { CloudStorageActionTypes } from 'actions/cloud-storage-actions';
import { OrganizationActionsTypes } from 'actions/organization-actions';
import { JobsActionTypes } from 'actions/jobs-actions';
import { WebhooksActionsTypes } from 'actions/webhooks-actions';
import { InvitationsActionTypes } from 'actions/invitations-actions';
import { ServerAPIActionTypes } from 'actions/server-actions';
import { RequestsActionsTypes } from 'actions/requests-actions';
import { ImportActionTypes } from 'actions/import-actions';
import { ExportActionTypes } from 'actions/export-actions';
import { ConsensusActionTypes } from 'actions/consensus-actions';
import { BulkActionsTypes } from 'actions/bulk-actions';
import { getInstanceType } from 'actions/common';
import { ResourceUpdateTypes } from 'utils/enums';

import config from 'config';
import { NotificationsState } from '.';

const shouldLog = (error: Error): boolean => {
    if (error instanceof ServerError) {
        const ignoredCodes = [
            // 0, Network Error: may not to be logged on server. Log it here.
            400, // client error: not interested
            401, // client error: not interested
            403, // client error: not interested
            404, // client error: not interested
            429, // client error: not interested
            500, // usually logged by server
            // 502, Bad Gateway: may not to be logged on server. Log it here.
            // 503, Service Unavailable: may not to be logged on server. Log it here.
            // 504, Gateway Timeout: may not to be logged on server. Log it here.
        ];
        return !ignoredCodes.includes(error.code);
    }

    return !(error instanceof RequestError);
};

const defaultState: NotificationsState = {
    errors: {
        auth: {
            authenticated: null,
            login: null,
            logout: null,
            register: null,
            changePassword: null,
            requestPasswordReset: null,
            resetPassword: null,
            updateUser: null,
            getApiTokens: null,
            createApiToken: null,
            updateApiToken: null,
            revokeApiToken: null,
        },
        serverAPI: {
            fetching: null,
        },
        projects: {
            fetching: null,
            updating: null,
            deleting: null,
            creating: null,
            restoring: null,
            backuping: null,
        },
        tasks: {
            fetching: null,
            updating: null,
            dumping: null,
            loading: null,
            exportingAsDataset: null,
            deleting: null,
            creating: null,
            exporting: null,
            importing: null,
            moving: null,
            mergingConsensus: null,
        },
        jobs: {
            updating: null,
            fetching: null,
            creating: null,
            deleting: null,
        },
        formats: {
            fetching: null,
        },
        users: {
            fetching: null,
        },
        about: {
            fetching: null,
        },
        models: {
            starting: null,
            fetching: null,
            canceling: null,
            metaFetching: null,
            inferenceStatusFetching: null,
            creating: null,
            deleting: null,
        },
        annotation: {
            saving: null,
            jobFetching: null,
            jobUpdating: null,
            frameFetching: null,
            changingLabelColor: null,
            updating: null,
            creating: null,
            merging: null,
            grouping: null,
            joining: null,
            slicing: null,
            splitting: null,
            removing: null,
            propagating: null,
            collectingStatistics: null,
            savingJob: null,
            uploadAnnotations: null,
            removeAnnotations: null,
            fetchingAnnotations: null,
            undo: null,
            redo: null,
            search: null,
            deleteFrame: null,
            restoreFrame: null,
            savingLogs: null,
            canvas: null,
        },
        boundaries: {
            resetError: null,
        },
        userAgreements: {
            fetching: null,
        },
        review: {
            commentingIssue: null,
            finishingIssue: null,
            reopeningIssue: null,
            resolvingIssue: null,
            submittingReview: null,
            deletingIssue: null,
        },
        exporting: {
            dataset: null,
            annotation: null,
            backup: null,
        },
        importing: {
            dataset: null,
            annotation: null,
            backup: null,
        },
        cloudStorages: {
            creating: null,
            fetching: null,
            updating: null,
            deleting: null,
        },
        organizations: {
            fetching: null,
            creating: null,
            updating: null,
            activation: null,
            deleting: null,
            leaving: null,
            inviting: null,
            updatingMembership: null,
            removingMembership: null,
            deletingInvitation: null,
        },
        webhooks: {
            fetching: null,
            creating: null,
            updating: null,
            deleting: null,
        },
        analytics: {
            fetching: null,
            fetchingSettings: null,
            updatingSettings: null,
        },
        invitations: {
            fetching: null,
            acceptingInvitation: null,
            decliningInvitation: null,
            resendingInvitation: null,
        },
        requests: {
            fetching: null,
            canceling: null,
            deleting: null,
        },
        bulkOperation: {
            processing: null,
        },
    },
    messages: {
        tasks: {
            loadingDone: null,
            importingDone: null,
            movingDone: null,
            mergingConsensusDone: null,
        },
        models: {
            inferenceDone: null,
        },
        auth: {
            changePasswordDone: null,
            registerDone: null,
            requestPasswordResetDone: null,
            resetPasswordDone: null,
        },
        projects: {
            restoringDone: null,
        },
        exporting: {
            dataset: null,
            annotation: null,
            backup: null,
        },
        importing: {
            dataset: null,
            annotation: null,
            backup: null,
        },
        invitations: {
            newInvitations: null,
            acceptInvitationDone: null,
            declineInvitationDone: null,
            resendingInvitation: null,
        },
    },
};

export default function (state = defaultState, action: AnyAction): NotificationsState {
    switch (action.type) {
        case AuthActionTypes.AUTHENTICATED_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        authenticated: {
                            message: i18n.t('Could not check authentication on the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.LOGIN_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        login: {
                            message: i18n.t('Could not login on the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-login-failed',
                        },
                    },
                },
            };
        }
        case AuthActionTypes.LOGOUT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        logout: {
                            message: i18n.t('Could not logout from the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.REGISTER_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        register: {
                            message: i18n.t('Could not register on the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.REGISTER_SUCCESS: {
            if (!action.payload.isVerified) {
                return {
                    ...state,
                    messages: {
                        ...state.messages,
                        auth: {
                            ...state.messages.auth,
                            registerDone: {
                                message: i18n.t('To use your account, you need to confirm the email address. We have sent an email with a confirmation link to {{email}}.', {
                                    ns: 'business', email: action.payload.userEmail,
                                }),
                            },
                        },
                    },
                };
            }

            return {
                ...state,
            };
        }
        case AuthActionTypes.CHANGE_PASSWORD_SUCCESS: {
            return {
                ...state,
                messages: {
                    ...state.messages,
                    auth: {
                        ...state.messages.auth,
                        changePasswordDone: {
                            message: i18n.t('New password has been saved.', { ns: 'business' }),
                            className: 'cvat-notification-notice-change-password-success',
                        },
                    },
                },
            };
        }
        case AuthActionTypes.CHANGE_PASSWORD_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        changePassword: {
                            message: i18n.t('Could not change password', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-change-password-failed',
                        },
                    },
                },
            };
        }
        case AuthActionTypes.REQUEST_PASSWORD_RESET_SUCCESS: {
            return {
                ...state,
                messages: {
                    ...state.messages,
                    auth: {
                        ...state.messages.auth,
                        requestPasswordResetDone: {
                            message: i18n.t(
                                "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.",
                                { ns: 'business' },
                            ),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.REQUEST_PASSWORD_RESET_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        requestPasswordReset: {
                            message: i18n.t('Could not reset password on the server.', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.RESET_PASSWORD_SUCCESS: {
            return {
                ...state,
                messages: {
                    ...state.messages,
                    auth: {
                        ...state.messages.auth,
                        resetPasswordDone: {
                            message: i18n.t('Password has been reset with the new password.', { ns: 'business' }),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.RESET_PASSWORD_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        resetPassword: {
                            message: i18n.t('Could not set new password on the server.', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AuthActionTypes.UPDATE_USER_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        updateUser: {
                            message: i18n.t('Could not update user information.', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ServerAPIActionTypes.GET_SERVER_API_SCHEMA_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    serverAPI: {
                        ...state.errors.serverAPI,
                        fetching: {
                            message: i18n.t('Could not receive server schema', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case InvitationsActionTypes.GET_INVITATIONS_SUCCESS: {
            if (action.payload.showNotification) {
                return {
                    ...state,
                    messages: {
                        ...state.messages,
                        invitations: {
                            ...state.messages.invitations,
                            newInvitations: {
                                message: i18n.t('You\'ve received an invitation to join an organization! [Click here](/invitations) to get details.', { ns: 'business' }),
                            },
                        },
                    },
                };
            }
            return state;
        }
        case InvitationsActionTypes.GET_INVITATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    invitations: {
                        ...state.errors.invitations,
                        fetching: {
                            message: i18n.t('Could not get invitations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-get-invitations-failed',
                        },
                    },
                },
            };
        }
        case InvitationsActionTypes.ACCEPT_INVITATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    invitations: {
                        ...state.errors.invitations,
                        acceptingInvitation: {
                            message: i18n.t('Could not accept invitation', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-accept-organization-invitation-failed',
                        },
                    },
                },
            };
        }
        case InvitationsActionTypes.DECLINE_INVITATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    invitations: {
                        ...state.errors.invitations,
                        decliningInvitation: {
                            message: i18n.t('Could not decline invitation', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-decline-organization-invitation-failed',
                        },
                    },
                },
            };
        }
        case InvitationsActionTypes.RESEND_INVITATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    invitations: {
                        ...state.errors.invitations,
                        resendingInvitation: {
                            message: i18n.t('Could not resend invitation', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-resend-organization-invitation-failed',
                        },
                    },
                },
            };
        }
        case InvitationsActionTypes.RESEND_INVITATION_SUCCESS: {
            return {
                ...state,
                messages: {
                    ...state.messages,
                    invitations: {
                        ...state.messages.invitations,
                        resendingInvitation: {
                            message: i18n.t('Invitation was sent successfully', { ns: 'business' }),
                        },
                    },
                },
            };
        }
        case ExportActionTypes.EXPORT_DATASET_FAILED: {
            const { instance, instanceType } = action.payload;
            const translatedInstanceType = i18n.t(instanceType, { ns: 'business' });
            return {
                ...state,
                errors: {
                    ...state.errors,
                    exporting: {
                        ...state.errors.exporting,
                        dataset: {
                            message: i18n.t(
                                'Could not export dataset for [{{instanceType}} {{id}}]({{url}})',
                                {
                                    ns: 'business',
                                    instanceType: translatedInstanceType,
                                    id: instance.id,
                                    url: `/${instanceType}s/${instance.id}`,
                                },
                            ),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ExportActionTypes.EXPORT_DATASET_SUCCESS: {
            const {
                instance, instanceType, resource, target,
            } = action.payload;
            const translatedResource = i18n.t(resource, { ns: 'business' });
            const translatedInstanceType = i18n.t(instanceType, { ns: 'business' });
            let description = '';
            if (target === StorageLocation.LOCAL) {
                description = i18n.t(
                    'Export {{resource}} for {{instanceType}} {{id}} is finished. You can [download it here](/requests).',
                    {
                        ns: 'business', resource: translatedResource, instanceType: translatedInstanceType, id: instance.id,
                    },
                );
            } else if (target === StorageLocation.CLOUD_STORAGE) {
                description = i18n.t(
                    'Export {{resource}} for {{instanceType}} {{id}} has been uploaded to cloud storage.',
                    {
                        ns: 'business', resource: translatedResource, instanceType: translatedInstanceType, id: instance.id,
                    },
                );
            }
            return {
                ...state,
                messages: {
                    ...state.messages,
                    exporting: {
                        ...state.messages.exporting,
                        dataset: {
                            message: i18n.t('Export is finished', { ns: 'business' }),
                            duration: config.REQUEST_SUCCESS_NOTIFICATION_DURATION,
                            className: `cvat-notification-notice-export-${instanceType.split(' ')[0]}-finished`,
                            description,
                        },
                    },
                },
            };
        }
        case ExportActionTypes.EXPORT_BACKUP_FAILED: {
            const { instance, instanceType } = action.payload;
            const translatedInstanceType = i18n.t(instanceType, { ns: 'business' });
            return {
                ...state,
                errors: {
                    ...state.errors,
                    exporting: {
                        ...state.errors.exporting,
                        backup: {
                            message: i18n.t('Could not export {{instanceType}} #{{id}}', {
                                ns: 'business', instanceType: translatedInstanceType, id: instance.id,
                            }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ExportActionTypes.EXPORT_BACKUP_SUCCESS: {
            const {
                instance, instanceType, target,
            } = action.payload;
            const translatedInstanceType = i18n.t(instanceType, { ns: 'business' });
            let description = '';
            if (target === StorageLocation.LOCAL) {
                description = i18n.t(
                    'Backup for {{instanceType}} {{id}} is finished. You can [download it here](/requests).',
                    { ns: 'business', instanceType: translatedInstanceType, id: instance.id },
                );
            } else if (target === StorageLocation.CLOUD_STORAGE) {
                description = i18n.t(
                    'Backup for {{instanceType}} {{id}} has been uploaded to cloud storage.',
                    { ns: 'business', instanceType: translatedInstanceType, id: instance.id },
                );
            }
            return {
                ...state,
                messages: {
                    ...state.messages,
                    exporting: {
                        ...state.messages.exporting,
                        backup: {
                            message: i18n.t('Backup export is finished', { ns: 'business' }),
                            duration: config.REQUEST_SUCCESS_NOTIFICATION_DURATION,
                            description,
                        },
                    },
                },
            };
        }
        case ImportActionTypes.IMPORT_DATASET_SUCCESS: {
            const { instance, resource } = action.payload;
            const instanceType = getInstanceType(instance);
            const translatedResource = i18n.t(resource, { ns: 'business' });
            const translatedInstanceType = i18n.t(instanceType, { ns: 'business' });
            let url = '';
            if (instanceType === 'project') {
                url = `/projects/${instance.id}`;
            } else if (instanceType === 'task') {
                url = `/tasks/${instance.id}`;
            } else {
                url = `/tasks/${instance.taskId}/jobs/${instance.id}`;
            }
            const description = i18n.t(
                '{{resource}} has been imported to [{{instanceType}} #{{id}}]({{url}})',
                {
                    ns: 'business',
                    resource: translatedResource,
                    instanceType: translatedInstanceType,
                    id: instance.id,
                    url,
                },
            );

            return {
                ...state,
                messages: {
                    ...state.messages,
                    importing: {
                        ...state.messages.importing,
                        [resource]: {
                            message: i18n.t('Annotations import is finished', { ns: 'business' }),
                            duration: config.REQUEST_SUCCESS_NOTIFICATION_DURATION,
                            description,
                        },
                    },
                },
            };
        }
        case ImportActionTypes.IMPORT_DATASET_FAILED: {
            const { instance, resource } = action.payload;
            const instanceType = resource === 'annotation' ? 'task' : 'project';
            const instanceId = resource === 'annotation' ? instance?.taskId || instance.id : instance.id;
            const message = i18n.t(
                'Could not import {{resource}} to [{{instanceType}} #{{id}}]({{url}})',
                {
                    ns: 'business',
                    resource: i18n.t(resource, { ns: 'business' }),
                    instanceType: i18n.t(instanceType, { ns: 'business' }),
                    id: instanceId,
                    url: `/${instanceType}s/${instanceId}`,
                },
            );
            return {
                ...state,
                errors: {
                    ...state.errors,
                    importing: {
                        ...state.errors.importing,
                        dataset: {
                            message,
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-' +
                                `${resource === 'annotation' ? 'load-annotation' : 'import-dataset'}-failed`,
                        },
                    },
                },
            };
        }
        case ImportActionTypes.IMPORT_BACKUP_SUCCESS: {
            const { instanceId, instanceType } = action.payload;
            const description = i18n.t(
                '{{instanceType}} has been restored successfully. Click [here]({{url}}) to open it.',
                {
                    ns: 'business',
                    instanceType: i18n.t(instanceType, { ns: 'business' }),
                    url: `/${instanceType}s/${instanceId}`,
                },
            );
            return {
                ...state,
                messages: {
                    ...state.messages,
                    importing: {
                        ...state.messages.importing,
                        backup: {
                            message: i18n.t('Import backup is finished', { ns: 'business' }),
                            duration: config.REQUEST_SUCCESS_NOTIFICATION_DURATION,
                            description,
                        },
                    },
                },
            };
        }
        case ImportActionTypes.IMPORT_BACKUP_FAILED: {
            const { instanceType } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    importing: {
                        ...state.errors.importing,
                        backup: {
                            message: i18n.t('Could not restore {{instanceType}} backup', {
                                ns: 'business', instanceType: i18n.t(instanceType, { ns: 'business' }),
                            }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case TasksActionTypes.GET_TASKS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    tasks: {
                        ...state.errors.tasks,
                        fetching: {
                            message: i18n.t('Could not fetch tasks', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case TasksActionTypes.DELETE_TASK_FAILED: {
            const { taskID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    tasks: {
                        ...state.errors.tasks,
                        deleting: {
                            message: i18n.t('Could not delete the [task #{{id}}](/tasks/{{id}})', { ns: 'business', id: taskID }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-delete-task-failed',
                        },
                    },
                },
            };
        }
        case TasksActionTypes.UPDATE_TASK_FAILED: {
            const { taskId, error, updateType } = action.payload;
            let message = i18n.t('Could not update the [task #{{id}}](/tasks/{{id}})', { ns: 'business', id: taskId });

            if (updateType === ResourceUpdateTypes.UPDATE_ORGANIZATION) {
                message = i18n.t('Could not transfer the [task #{{id}}](/tasks/{{id}}) to the new workspace', { ns: 'business', id: taskId });
            }

            return {
                ...state,
                errors: {
                    ...state.errors,
                    tasks: {
                        ...state.errors.tasks,
                        updating: {
                            message,
                            reason: error.toString(),
                            shouldLog: shouldLog(error),
                            className: 'cvat-notification-notice-update-task-failed',
                        },
                    },
                },
            };
        }
        case ConsensusActionTypes.MERGE_CONSENSUS_JOBS_SUCCESS: {
            const { instance } = action.payload;
            let message = '';
            const instanceType = getInstanceType(instance);
            if (instanceType === 'job') {
                message = i18n.t(
                    'Consensus [job #{{id}}](/tasks/{{taskId}}/jobs/{{id}}) has been merged',
                    { ns: 'business', id: instance.id, taskId: instance.taskId },
                );
            } else if (instanceType === 'task') {
                message = i18n.t('Consensus jobs in the [task #{{id}}](/tasks/{{id}}) have been merged', { ns: 'business', id: instance.id });
            }
            return {
                ...state,
                messages: {
                    ...state.messages,
                    tasks: {
                        ...state.messages.tasks,
                        mergingConsensusDone: {
                            message,
                        },
                    },
                },
            };
        }
        case ConsensusActionTypes.MERGE_CONSENSUS_JOBS_FAILED: {
            const { instance } = action.payload;
            let message = '';
            const instanceType = getInstanceType(instance);
            if (instanceType === 'job') {
                message = i18n.t(
                    'Could not merge the [job #{{id}}](/tasks/{{taskId}}/jobs/{{id}})',
                    { ns: 'business', id: instance.id, taskId: instance.taskId },
                );
            } else if (instanceType === 'task') {
                message = i18n.t('Could not merge the [task #{{id}}](/tasks/{{id}})', { ns: 'business', id: instance.id });
            }
            return {
                ...state,
                errors: {
                    ...state.errors,
                    tasks: {
                        ...state.errors.tasks,
                        mergingConsensus: {
                            message,
                            reason: action.payload.error,
                            shouldLog: !(action.payload.error instanceof ServerError),
                            className: 'cvat-notification-notice-consensus-merge-task-failed',
                        },
                    },
                },
            };
        }
        case TasksActionTypes.CREATE_TASK_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    tasks: {
                        ...state.errors.tasks,
                        creating: {
                            message: i18n.t('Could not create the task', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-create-task-failed',
                        },
                    },
                },
            };
        }
        case ProjectsActionTypes.GET_PROJECTS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    projects: {
                        ...state.errors.projects,
                        fetching: {
                            message: i18n.t('Could not fetch projects', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ProjectsActionTypes.CREATE_PROJECT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    projects: {
                        ...state.errors.projects,
                        creating: {
                            message: i18n.t('Could not create the project', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-create-project-failed',
                        },
                    },
                },
            };
        }
        case ProjectsActionTypes.DELETE_PROJECT_FAILED: {
            const { projectId } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    projects: {
                        ...state.errors.projects,
                        updating: {
                            message: i18n.t('Could not delete [project #{{id}}](/project/{{id}})', { ns: 'business', id: projectId }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-delete-project-failed',
                        },
                    },
                },
            };
        }
        case ProjectsActionTypes.UPDATE_PROJECT_FAILED: {
            const { projectId, error, updateType } = action.payload;
            let message = i18n.t('Could not update the [project #{{id}}](/projects/{{id}})', { ns: 'business', id: projectId });

            if (updateType === ResourceUpdateTypes.UPDATE_ORGANIZATION) {
                message = i18n.t('Could not transfer the [project #{{id}}](/projects/{{id}}) to the new workspace', { ns: 'business', id: projectId });
            }

            return {
                ...state,
                errors: {
                    ...state.errors,
                    projects: {
                        ...state.errors.projects,
                        creating: {
                            message,
                            reason: error.toString(),
                            className: 'cvat-notification-notice-update-project-failed',
                            shouldLog: shouldLog(error),
                        },
                    },
                },
            };
        }
        case FormatsActionTypes.GET_FORMATS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    formats: {
                        ...state.errors.formats,
                        fetching: {
                            message: i18n.t('Could not get formats from the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AboutActionTypes.GET_ABOUT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    about: {
                        ...state.errors.about,
                        fetching: {
                            message: i18n.t('Could not get info about the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.GET_INFERENCE_STATUS_SUCCESS: {
            if (action.payload.activeInference.status === 'finished') {
                const { taskID } = action.payload;
                return {
                    ...state,
                    messages: {
                        ...state.messages,
                        models: {
                            ...state.messages.models,
                            inferenceDone: {
                                message: i18n.t('Automatic annotation accomplished for the [task #{{id}}](/tasks/{{id}})', { ns: 'business', id: taskID }),
                            },
                        },
                    },
                };
            }

            return {
                ...state,
            };
        }
        case ModelsActionTypes.FETCH_META_FAILED: {
            if (action.payload.error.code === 403) {
                return state;
            }

            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        metaFetching: {
                            message: i18n.t('Could not fetch models meta information', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.GET_INFERENCE_STATUS_FAILED: {
            const { taskID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        inferenceStatusFetching: {
                            message: i18n.t('Fetching inference status for the [task #{{id}}](/tasks/{{id}})', { ns: 'business', id: taskID }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.GET_MODELS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        fetching: {
                            message: i18n.t('Could not get models from the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.START_INFERENCE_FAILED: {
            const { taskID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        starting: {
                            message: i18n.t('Could not infer model for the [task #{{id}}](/tasks/{{id}})', { ns: 'business', id: taskID }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ModelsActionTypes.CANCEL_INFERENCE_FAILED: {
            const { taskID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    models: {
                        ...state.errors.models,
                        canceling: {
                            message: i18n.t('Could not cancel model inference for the [task #{{id}}](/tasks/{{id}})', { ns: 'business', id: taskID }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.GET_JOB_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        jobFetching: {
                            message: i18n.t('Error during fetching a job', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-fetch-job-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.CHANGE_FRAME_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        frameFetching: {
                            message: i18n.t('Could not receive frame {{number}}', { ns: 'business', number: action.payload.number }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SAVE_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        saving: {
                            message: i18n.t('Could not save annotations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-save-annotations-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.UPDATE_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        updating: {
                            message: i18n.t('Could not update annotations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-update-annotations-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.CREATE_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        creating: {
                            message: i18n.t('Could not create annotations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.MERGE_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        merging: {
                            message: i18n.t('Could not merge annotations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.GROUP_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        grouping: {
                            message: i18n.t('Could not group annotations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.JOIN_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        joining: {
                            message: i18n.t('Could not join annotations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SLICE_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        slicing: {
                            message: i18n.t('Could not slice the object', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SPLIT_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        splitting: {
                            message: i18n.t('Could not split the track', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.REMOVE_OBJECT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        removing: {
                            message: i18n.t('Could not remove the object', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-remove-object-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.PROPAGATE_OBJECT_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        propagating: {
                            message: i18n.t('Could not propagate the object', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.COLLECT_STATISTICS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        collectingStatistics: {
                            message: i18n.t('Could not collect annotations statistics', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.UPLOAD_JOB_ANNOTATIONS_FAILED: {
            const { job, error } = action.payload;

            const {
                id: jobID,
                taskId: taskID,
            } = job;

            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        uploadAnnotations: {
                            message: i18n.t(
                                'Could not upload annotations for [job #{{jobId}}](/tasks/{{taskId}}/jobs/{{jobId}})',
                                { ns: 'business', jobId: jobID, taskId: taskID },
                            ),
                            reason: error.toString(),
                            className: 'cvat-notification-notice-upload-annotations-fail',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.REMOVE_JOB_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        removeAnnotations: {
                            message: i18n.t('Could not remove annotations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.FETCH_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        fetchingAnnotations: {
                            message: i18n.t('Could not fetch annotations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.REDO_ACTION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        redo: {
                            message: i18n.t('Could not redo', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.UNDO_ACTION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        undo: {
                            message: i18n.t('Could not undo', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SEARCH_ANNOTATIONS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        search: {
                            message: i18n.t('Could not execute search annotations', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.SAVE_LOGS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        savingLogs: {
                            message: i18n.t('Could not send logs to the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case BoundariesActionTypes.THROW_RESET_ERROR: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    boundaries: {
                        ...state.errors.annotation,
                        resetError: {
                            message: i18n.t('Could not reset the state', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case UserAgreementsActionTypes.GET_USER_AGREEMENTS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    userAgreements: {
                        ...state.errors.userAgreements,
                        fetching: {
                            message: i18n.t('Could not get user agreements from the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.FINISH_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        finishingIssue: {
                            message: i18n.t('Could not open a new issue', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.RESOLVE_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        resolvingIssue: {
                            message: i18n.t('Could not resolve the issue', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.REOPEN_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        reopeningIssue: {
                            message: i18n.t('Could not reopen the issue', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case RequestsActionsTypes.GET_REQUESTS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    requests: {
                        ...state.errors.requests,
                        fetching: {
                            message: i18n.t('Could not fetch requests from the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case RequestsActionsTypes.CANCEL_REQUEST_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    requests: {
                        ...state.errors.requests,
                        canceling: {
                            message: i18n.t('Could not cancel the request', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case RequestsActionsTypes.DELETE_REQUEST_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    requests: {
                        ...state.errors.requests,
                        deleting: {
                            message: i18n.t('Could not delete the request', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.COMMENT_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        commentingIssue: {
                            message: i18n.t('Could not comment the issue', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.SUBMIT_REVIEW_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        submittingReview: {
                            message: i18n.t('Could not submit review for the job {{id}}', { ns: 'business', id: action.payload.jobId }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case ReviewActionTypes.REMOVE_ISSUE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    review: {
                        ...state.errors.review,
                        deletingIssue: {
                            message: i18n.t('Could not remove issue from the server', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case NotificationsActionType.RESET_ERRORS: {
            return {
                ...state,
                errors: {
                    ...defaultState.errors,
                },
            };
        }
        case NotificationsActionType.RESET_MESSAGES: {
            return {
                ...state,
                messages: {
                    ...defaultState.messages,
                },
            };
        }
        case AnnotationActionTypes.GET_DATA_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        jobFetching: {
                            message: i18n.t('Could not receive image data', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-fetch-frame-data-from-the-server-failed',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.CANVAS_ERROR_OCCURRED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        canvas: {
                            message: i18n.t('Canvas error occurred', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: true,
                            className: 'cvat-notification-notice-canvas-error-occurred',
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.DELETE_FRAME_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        deleteFrame: {
                            message: i18n.t('Could not delete frame', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case AnnotationActionTypes.RESTORE_FRAME_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    annotation: {
                        ...state.errors.annotation,
                        restoreFrame: {
                            message: i18n.t('Could not restore frame', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        fetching: {
                            message: i18n.t('Could not fetch cloud storage', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.CREATE_CLOUD_STORAGE_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        creating: {
                            message: i18n.t('Could not create the cloud storage', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-create-cloud-storage-failed',
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.UPDATE_CLOUD_STORAGE_FAILED: {
            const { cloudStorage, error } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        updating: {
                            message: i18n.t('Could not update cloud storage #{{id}}', { ns: 'business', id: cloudStorage.id }),
                            reason: error.toString(),
                            className: 'cvat-notification-notice-update-cloud-storage-failed',
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.DELETE_CLOUD_STORAGE_FAILED: {
            const { cloudStorageID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        deleting: {
                            message: i18n.t('Could not delete cloud storage {{id}}', { ns: 'business', id: cloudStorageID }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-delete-cloud-storage-failed',
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.LOAD_CLOUD_STORAGE_CONTENT_FAILED: {
            const { cloudStorageID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        fetching: {
                            message: i18n.t('Could not fetch content for cloud storage #{{id}}', { ns: 'business', id: cloudStorageID }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-fetch-cloud-storage-content-failed',
                        },
                    },
                },
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_STATUS_FAILED: {
            const { cloudStorageID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        fetching: {
                            message: i18n.t('Could not fetch cloud storage #{{id}} status', { ns: 'business', id: cloudStorageID }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-fetch-cloud-storage-status-failed',
                        },
                    },
                },
            };
        }

        case CloudStorageActionTypes.GET_CLOUD_STORAGE_PREVIEW_FAILED: {
            const { cloudStorageID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    cloudStorages: {
                        ...state.errors.cloudStorages,
                        fetching: {
                            message: i18n.t('Could not fetch preview for cloud storage #{{id}}', { ns: 'business', id: cloudStorageID }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-fetch-cloud-storage-preview-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.CREATE_ORGANIZATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        creating: {
                            message: i18n.t('Could not create organization {{slug}}', { ns: 'business', slug: action.payload.slug }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-create-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.UPDATE_ORGANIZATION_FAILED: {
            const { slug } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        updating: {
                            message: i18n.t('Could not update organization "{{slug}}"', { ns: 'business', slug }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-update-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.ACTIVATE_ORGANIZATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        activation: {
                            message: i18n.t('Could not activate organization {{slug}}', { ns: 'business', slug: action.payload.slug || '' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-activate-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.REMOVE_ORGANIZATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        deleting: {
                            message: i18n.t('Could not remove organization {{slug}}', { ns: 'business', slug: action.payload.slug }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-remove-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.INVITE_ORGANIZATION_MEMBERS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        inviting: {
                            message: i18n.t('Could not invite organization members', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-invite-organization-members-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.INVITE_ORGANIZATION_MEMBER_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        inviting: {
                            message: i18n.t('Could not invite this member "{{email}}" to the organization', { ns: 'business', email: action.payload.email }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-invite-organization-member-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.LEAVE_ORGANIZATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        leaving: {
                            message: i18n.t('Could not leave the organization', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-leave-organization-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.REMOVE_ORGANIZATION_MEMBER_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        removingMembership: {
                            message: i18n.t('Could not remove member "{{username}}" from the organization', { ns: 'business', username: action.payload.username }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-remove-organization-member-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.UPDATE_ORGANIZATION_MEMBER_FAILED: {
            const { role, username } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        updatingMembership: {
                            message: i18n.t('Could not assign role "{{role}}" to the user "{{username}}"', { ns: 'business', role, username }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-update-organization-membership-failed',
                        },
                    },
                },
            };
        }
        case OrganizationActionsTypes.GET_ORGANIZATIONS_FAILED: {
            const { error } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    organizations: {
                        ...state.errors.organizations,
                        fetching: {
                            message: i18n.t('Could not fetch the list of organizations', { ns: 'business' }),
                            reason: error,
                            shouldLog: shouldLog(error),
                        },
                    },
                },
            };
        }
        case JobsActionTypes.GET_JOBS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    jobs: {
                        ...state.errors.jobs,
                        fetching: {
                            message: i18n.t('Could not fetch a list of jobs', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-get-jobs-failed',
                        },
                    },
                },
            };
        }
        case JobsActionTypes.CREATE_JOB_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    jobs: {
                        ...state.errors.jobs,
                        creating: {
                            message: i18n.t('Could not create job', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-create-job-failed',
                        },
                    },
                },
            };
        }
        case JobsActionTypes.UPDATE_JOB_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    jobs: {
                        ...state.errors.jobs,
                        updating: {
                            message: i18n.t('Could not update job', { ns: 'business' }),
                            reason: action.payload.error.toString(),
                            className: 'cvat-notification-notice-update-job-failed',
                        },
                    },
                },
            };
        }
        case JobsActionTypes.DELETE_JOB_FAILED: {
            const { jobID } = action.payload;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    jobs: {
                        ...state.errors.jobs,
                        deleting: {
                            message: i18n.t('Could not delete the job #{{id}}', { ns: 'business', id: jobID }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-delete-job-failed',
                        },
                    },
                },
            };
        }
        case WebhooksActionsTypes.GET_WEBHOOKS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    webhooks: {
                        ...state.errors.webhooks,
                        fetching: {
                            message: i18n.t('Could not fetch a list of webhooks', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-get-webhooks-failed',
                        },
                    },
                },
            };
        }
        case WebhooksActionsTypes.CREATE_WEBHOOK_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    webhooks: {
                        ...state.errors.webhooks,
                        creating: {
                            message: i18n.t('Could not create webhook', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-create-webhook-failed',
                        },
                    },
                },
            };
        }
        case WebhooksActionsTypes.UPDATE_WEBHOOK_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    webhooks: {
                        ...state.errors.webhooks,
                        updating: {
                            message: i18n.t('Could not update webhook', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-update-webhook-failed',
                        },
                    },
                },
            };
        }
        case WebhooksActionsTypes.DELETE_WEBHOOK_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    webhooks: {
                        ...state.errors.webhooks,
                        deleting: {
                            message: i18n.t('Could not delete webhook', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-delete-webhook-failed',
                        },
                    },
                },
            };
        }
        case BulkActionsTypes.BULK_OPERATION_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    bulkOperation: {
                        ...state.errors.bulkOperation,
                        processing: {
                            message: i18n.t('Bulk operation failed.', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-bulk-operation-failed',
                            remainingItemsCount: action.payload.remainingItemsCount,
                            retryPayload: action.payload.retryPayload,
                            ignore: true,
                        },
                    },
                },
            };
        }
        case AuthActionTypes.GET_API_TOKENS_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        getApiTokens: {
                            message: i18n.t('Could not get API tokens', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-get-api-tokens-failed',
                        },
                    },
                },
            };
        }
        case AuthActionTypes.CREATE_API_TOKEN_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        createApiToken: {
                            message: i18n.t('Could not create API token', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-create-api-token-failed',
                        },
                    },
                },
            };
        }
        case AuthActionTypes.UPDATE_API_TOKEN_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        updateApiToken: {
                            message: i18n.t('Could not update API token', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-update-api-token-failed',
                        },
                    },
                },
            };
        }
        case AuthActionTypes.REVOKE_API_TOKEN_FAILED: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    auth: {
                        ...state.errors.auth,
                        revokeApiToken: {
                            message: i18n.t('Could not revoke API token', { ns: 'business' }),
                            reason: action.payload.error,
                            shouldLog: shouldLog(action.payload.error),
                            className: 'cvat-notification-notice-revoke-api-token-failed',
                        },
                    },
                },
            };
        }
        case BoundariesActionTypes.RESET_AFTER_ERROR:
        case AuthActionTypes.LOGOUT_SUCCESS: {
            return { ...defaultState };
        }
        default: {
            return state;
        }
    }
}
