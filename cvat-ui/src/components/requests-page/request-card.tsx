// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import { Row, Col } from 'antd/lib/grid';
import Card from 'antd/lib/card';
import Text from 'antd/lib/typography/Text';
import Progress from 'antd/lib/progress';
import { MoreOutlined } from '@ant-design/icons';
import Button from 'antd/lib/button';
import { MenuProps } from 'antd/lib/menu';
import { BaseType } from 'antd/lib/typography/Base';
import i18n from 'i18next';

import { RQStatus, Request } from 'cvat-core-wrapper';
import { useContextMenuClick } from 'utils/hooks';

import StatusMessage from './request-status';
import RequestActionsComponent from './actions-menu';

export interface Props {
    request: Request;
    cancelled: boolean;
    selected?: boolean;
    onClick?: (event?: React.MouseEvent) => void;
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

function constructName(operation: Request['operation']): string | null {
    const {
        target, jobID, taskID, projectID,
    } = operation;

    if (target === 'project' && projectID) {
        return i18n.t('Project #{{id}}', { ns: 'business', id: projectID });
    }
    if (target === 'task' && taskID) {
        return i18n.t('Task #{{id}}', { ns: 'business', id: taskID });
    }
    if (target === 'job' && jobID) {
        return i18n.t('Job #{{id}}', { ns: 'business', id: jobID });
    }
    return null;
}

function constructTypeText(type: string): string {
    return type.split(':').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function renderEllipsisText(text: string, type?: BaseType): JSX.Element {
    return (
        <Text ellipsis={{ tooltip: text }} type={type}>
            {text}
        </Text>
    );
}

function constructTimestamps(request: Request): JSX.Element {
    const started = dayjs(request.startedDate).format('MMM Do YY, H:mm');
    const finished = dayjs(request.finishedDate).format('MMM Do YY, H:mm');
    const created = dayjs(request.createdDate).format('MMM Do YY, H:mm');
    const expired = dayjs(request.expiryDate).format('MMM Do YY, H:mm');
    const { operation: { type }, url } = request;

    switch (request.status) {
        case RQStatus.FINISHED: {
            const exportToCloudStorage = type.includes('export') && !url;
            if (request.expiryDate && !type.includes('create') && !type.includes('import') && !exportToCloudStorage) {
                return (
                    <>
                        <Row>
                            {renderEllipsisText(i18n.t('Started by {{owner}} on {{date}}', {
                                ns: 'business', owner: request.owner.username, date: started,
                            }), 'secondary')}
                        </Row>
                        <Row>
                            <Text type='secondary'>{i18n.t('Expires on {{date}}', { ns: 'business', date: expired })}</Text>
                        </Row>
                    </>
                );
            }
            return (
                <>
                    <Row>
                        {renderEllipsisText(i18n.t('Started by {{owner}} on {{date}}', {
                            ns: 'business', owner: request.owner.username, date: started,
                        }), 'secondary')}
                    </Row>
                    <Row>
                        <Text type='secondary'>{i18n.t('Finished on {{date}}', { ns: 'business', date: finished })}</Text>
                    </Row>
                </>
            );
        }
        case RQStatus.FAILED: {
            return (request.startedDate ? (
                <Row>
                    {renderEllipsisText(i18n.t('Started by {{owner}} on {{date}}', {
                        ns: 'business', owner: request.owner.username, date: started,
                    }), 'secondary')}
                </Row>
            ) : (
                <Row>
                    {renderEllipsisText(i18n.t('Enqueued by {{owner}} on {{date}}', {
                        ns: 'business', owner: request.owner.username, date: created,
                    }), 'secondary')}
                </Row>
            ));
        }
        case RQStatus.STARTED: {
            return (
                <>
                    <Row>
                        {renderEllipsisText(i18n.t('Enqueued by {{owner}} on {{date}}', {
                            ns: 'business', owner: request.owner.username, date: created,
                        }), 'secondary')}
                    </Row>
                    <Row>
                        <Text type='secondary'>{i18n.t('Started on {{date}}', { ns: 'business', date: started })}</Text>
                    </Row>
                </>
            );
        }
        default: {
            return (
                <Row>
                    {renderEllipsisText(i18n.t('Enqueued by {{owner}} on {{date}}', {
                        ns: 'business', owner: request.owner.username, date: created,
                    }), 'secondary')}
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
    xxl: 7,
};

function RequestCard(props: Readonly<Props>): JSX.Element {
    const {
        request, cancelled, selected, onClick,
    } = props;
    const { operation } = request;
    const { itemRef, handleContextMenuClick, handleContextMenuCapture } = useContextMenuClick<HTMLDivElement>();
    const { type } = operation;

    const linkToEntity = constructLink(request);
    const percent = request.status === RQStatus.FINISHED ? 100 : (request.progress ?? 0) * 100;
    const timestamps = constructTimestamps(request);
    const typeText = i18n.t(constructTypeText(type), { ns: 'business' });

    const name = constructName(operation);

    const percentProgress = (request.status === RQStatus.FAILED || !percent) ? '' : `${percent.toFixed(2)}%`;

    const style: React.CSSProperties = {};
    if (cancelled) {
        style.pointerEvents = 'none';
        style.opacity = 0.5;
    }

    const card = (menuItems: NonNullable<MenuProps['items']>): JSX.Element => (
        <Card
            ref={itemRef}
            className={`cvat-requests-card${selected ? ' cvat-item-selected' : ''}`}
            style={style}
            onClick={onClick}
            onContextMenuCapture={handleContextMenuCapture}
        >
            <Row justify='space-between'>
                <Col span={12}>
                    <Row style={{ paddingBottom: [RQStatus.FAILED].includes(request.status) ? '10px' : '0' }} gutter={8}>
                        <Col className='cvat-requests-type' {...dimensions}>
                            {renderEllipsisText(typeText)}
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
                            <StatusMessage
                                message={request.message}
                                status={request.status}
                                cancelled={cancelled}
                            />
                            <Row>
                                <Col span={18} className='cvat-requests-progress'>
                                    {request.status !== RQStatus.FAILED && (
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
                                    )}
                                </Col>
                                <Col span={2} className='cvat-requests-percent'>
                                    {percentProgress}
                                </Col>
                            </Row>
                            {operation?.format && (
                                <Row>
                                    <Col className='cvat-format-name'>
                                        {renderEllipsisText(operation.format, 'secondary')}
                                    </Col>
                                </Row>
                            )}
                            {operation?.lightweight && (
                                <Row>
                                    <Col className='cvat-lightweight-label'>
                                        <Text type='secondary'>{i18n.t('Lightweight backup', { ns: 'business' })}</Text>
                                    </Col>
                                </Row>
                            )}
                        </Col>
                        <Col span={3} style={{ display: 'flex', justifyContent: 'end' }}>
                            {menuItems.length > 0 && (
                                <Button
                                    type='link'
                                    size='middle'
                                    className='cvat-requests-page-actions-button cvat-actions-menu-button'
                                    icon={<MoreOutlined className='cvat-menu-icon' />}
                                    onClick={handleContextMenuClick}
                                />
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
    );

    return (
        <RequestActionsComponent
            requestInstance={request}
            dropdownTrigger={['contextMenu']}
            triggerElement={card}
        />
    );
}

export default React.memo(RequestCard);
