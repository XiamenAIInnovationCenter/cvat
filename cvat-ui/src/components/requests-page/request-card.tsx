// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Link } from 'react-router-dom';

import { Row, Col } from 'antd/lib/grid';
import { useDispatch } from 'react-redux';

import Card from 'antd/lib/card';
import Text from 'antd/lib/typography/Text';
import Progress from 'antd/lib/progress';
import { MoreOutlined } from '@ant-design/icons';
import Dropdown from 'antd/lib/dropdown';
import Button from 'antd/lib/button';
import { MenuProps } from 'antd/lib/menu';

import { RQStatus, Request } from 'cvat-core-wrapper';

import moment from 'moment';
import 'moment/locale/zh-cn';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { cancelRequestAsync } from 'actions/requests-async-actions';
import { requestsActions } from 'actions/requests-actions';
import StatusMessage from './request-status';

export interface Props {
    request: Request;
    disabled: boolean;
}

function constructLink(request: Request): string | null {
    const {
        type, target, jobID, taskID, projectID,
    } = request.operation;

    if (request.status === RQStatus.FAILED && type.includes('create')) {
        return null;
    }

    if (target === 'project' && projectID) {
        return `/projects/${projectID}`;
    }
    if (target === 'task' && taskID) {
        return `/tasks/${taskID}`;
    }
    if (target === 'job' && jobID) {
        return `/tasks/${taskID}/jobs/${jobID}`;
    }
    return null;
}

function constructName(operation: typeof Request['operation'], t: TFunction<'business'>): string | null {
    const {
        target, jobID, taskID, projectID,
    } = operation;

    if (target === 'project' && projectID) {
        return t('Project #{{id}}', { id: projectID });
    }
    if (target === 'task' && taskID) {
        return t('Task #{{id}}', { id: taskID });
    }
    if (target === 'job' && jobID) {
        return t('Job #{{id}}', { id: jobID });
    }
    return null;
}

function constructTimestamps(request: Request, t: TFunction<'business'>, language: string): JSX.Element {
    const locale = language.toLowerCase();
    const started = moment(request.startedDate).locale(locale).format('lll');
    const finished = moment(request.finishedDate).locale(locale).format('lll');
    const created = moment(request.createdDate).locale(locale).format('lll');
    const expired = moment(request.expiryDate).locale(locale).format('lll');
    const { operation: { type }, url } = request;

    switch (request.status) {
        case RQStatus.FINISHED: {
            const exportToCloudStorage = type.includes('export') && !url;
            if (request.expiryDate && !type.includes('create') && !type.includes('import') && !exportToCloudStorage) {
                return (
                    <>
                        <Row>
                            <Text type='secondary'>{t('Started by {{owner}} on {{date}}', { owner: request.owner.username, date: started })}</Text>
                        </Row>
                        <Row>
                            <Text type='secondary'>{t('Expires on {{date}}', { date: expired })}</Text>
                        </Row>
                    </>
                );
            }
            return (
                <>
                    <Row>
                        <Text type='secondary'>{t('Started by {{owner}} on {{date}}', { owner: request.owner.username, date: started })}</Text>
                    </Row>
                    <Row>
                        <Text type='secondary'>{t('Finished on {{date}}', { date: finished })}</Text>
                    </Row>
                </>
            );
        }
        case RQStatus.FAILED: {
            return (request.startedDate ? (
                <Row>
                    <Text type='secondary'>{t('Started by {{owner}} on {{date}}', { owner: request.owner.username, date: started })}</Text>
                </Row>
            ) : (
                <Row>
                    <Text type='secondary'>{t('Enqueued by {{owner}} on {{date}}', { owner: request.owner.username, date: created })}</Text>
                </Row>
            ));
        }
        case RQStatus.STARTED: {
            return (
                <>
                    <Row>
                        <Text type='secondary'>{t('Enqueued by {{owner}} on {{date}}', { owner: request.owner.username, date: created })}</Text>
                    </Row>
                    <Row>
                        <Text type='secondary'>{t('Started on {{date}}', { date: started })}</Text>
                    </Row>
                </>
            );
        }
        default: {
            return (
                <Row>
                    <Text type='secondary'>{t('Enqueued by {{owner}} on {{date}}', { owner: request.owner.username, date: created })}</Text>
                </Row>
            );
        }
    }
}

const dimensions = {
    xs: 6,
    sm: 6,
    md: 8,
    lg: 8,
    xl: 8,
    xxl: 6,
};

function RequestCard(props: Props): JSX.Element {
    const { t, i18n } = useTranslation('business');
    const { request, disabled } = props;
    const { operation } = request;
    const { type } = operation;

    const dispatch = useDispatch();

    const linkToEntity = constructLink(request);
    const percent = request.status === RQStatus.FINISHED ? 100 : (request.progress ?? 0) * 100;
    const timestamps = constructTimestamps(request, t, i18n.language);

    const name = constructName(operation, t);

    const percentProgress = (request.status === RQStatus.FAILED || !percent) ? '' : `${percent.toFixed(2)}%`;

    const style: React.CSSProperties = {};
    if (disabled) {
        style.pointerEvents = 'none';
        style.opacity = 0.5;
    }

    const menuItems: NonNullable<MenuProps['items']> = [];
    if (request?.url) {
        menuItems.push({
            key: 'download',
            label: t('Download'),
            onClick: () => {
                const downloadAnchor = window.document.getElementById('downloadAnchor') as HTMLAnchorElement;
                downloadAnchor.href = request.url;
                downloadAnchor.click();
                dispatch(requestsActions.disableRequest(request));
            },
        });
    }

    // only queued requests can be canceled now
    if (request.status === RQStatus.QUEUED) {
        menuItems.push({
            key: 'cancel',
            label: t('Cancel'),
            onClick: () => {
                dispatch(cancelRequestAsync(request, () => {
                    dispatch(requestsActions.disableRequest(request));
                }));
            },
        });
    }

    return (
        <Card className='cvat-requests-card' style={style}>
            <Row justify='space-between'>
                <Col span={12}>
                    <Row style={{ paddingBottom: [RQStatus.FAILED].includes(request.status) ? '10px' : '0' }}>
                        <Col className='cvat-requests-type' {...dimensions}>
                            <Text>
                                {type.split(':').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                {' '}
                            </Text>
                        </Col>
                        {name && (
                            <Col className='cvat-requests-name'>
                                {linkToEntity ?
                                    (<Link to={linkToEntity}>{name}</Link>) :
                                    <Text>{name}</Text>}
                            </Col>
                        )}
                    </Row>
                    {timestamps}
                </Col>
                <Col span={10} className='cvat-request-item-progress-wrapper'>
                    <Row>
                        <Col span={21}>
                            <Row />
                            <StatusMessage message={request.message} status={request.status} />
                            <Row>
                                <Col span={18} className='cvat-requests-progress'>
                                    {
                                        request.status !== RQStatus.FAILED ? (
                                            <Progress
                                                percent={percent}
                                                strokeColor={{
                                                    from: '#108ee9',
                                                    to: '#87d068',
                                                }}
                                                showInfo={false}
                                                strokeWidth={5}
                                                size='small'
                                            />
                                        ) : null
                                    }
                                </Col>
                                <Col span={2} className='cvat-requests-percent'>
                                    {percentProgress}
                                </Col>
                            </Row>
                            {
                                operation?.format ? (
                                    <Row>
                                        <Col className='cvat-format-name'>
                                            <Text type='secondary'>{operation.format}</Text>
                                        </Col>
                                    </Row>
                                ) : null
                            }
                        </Col>
                        <Col span={3} style={{ display: 'flex', justifyContent: 'end' }}>
                            {
                                menuItems.length !== 0 ? (
                                    <Dropdown
                                        destroyPopupOnHide
                                        trigger={['click']}
                                        menu={{
                                            items: menuItems,
                                            triggerSubMenuAction: 'click',
                                            className: 'cvat-request-menu',
                                        }}
                                    >
                                        <Button type='link' size='middle' className='cvat-requests-page-actions-button' icon={<MoreOutlined className='cvat-menu-icon' />} />
                                    </Dropdown>
                                ) : null
                            }
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
    );
}

export default React.memo(RequestCard);
