// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Col, Row } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import Text from 'antd/lib/typography/Text';
import Paragraph from 'antd/lib/typography/Paragraph';
import { MoreOutlined } from '@ant-design/icons';

import { getSelectedGroups } from 'components/setup-webhook-pages/setup-webhook-content';
import { type WebhookEvent } from 'cvat-core-wrapper';
import CVATTooltip from 'components/common/cvat-tooltip';
import { useSelector } from 'react-redux';
import { CombinedState } from 'reducers';
import { useContextMenuClick } from 'utils/hooks';
import WebhookActionsMenu from './actions-menu';

export interface WebhookItemProps {
    webhookInstance: any;
    webhookEvents: WebhookEvent[];
    selected: boolean;
    onClick: (event: React.MouseEvent) => boolean;
}

interface WebhookStatus {
    message?: string;
    className: string;
}

function setUpWebhookStatus(
    status: number | string,
    t: (key: string, options?: Record<string, unknown>) => string,
): WebhookStatus {
    if (status?.toString().startsWith('2')) {
        return {
            message: t('Last delivery was successful. Response: {{status}}', { status }),
            className: 'cvat-webhook-status-available',
        };
    }
    if (status?.toString().startsWith('5')) {
        return {
            message: t('Last delivery was not successful. Response: {{status}}', { status }),
            className: 'cvat-webhook-status-failed',
        };
    }
    return {
        message: status ? t('Response: {{status}}', { status }) : undefined,
        className: 'cvat-webhook-status-unavailable',
    };
}

function WebhookItem(props: Readonly<WebhookItemProps>): JSX.Element | null {
    const { t } = useTranslation('business');
    const [pingFetching, setPingFetching] = useState<boolean>(false);
    const {
        webhookInstance, webhookEvents, selected, onClick,
    } = props;
    const {
        id, description, updatedDate, createdDate, owner, targetURL, events,
    } = webhookInstance;

    const updated = dayjs(updatedDate).fromNow();
    const created = dayjs(createdDate).format('LL');
    const username = owner ? owner.username : null;

    const { lastStatus } = webhookInstance;
    const [lastResponseStatus, setLastResponseStatus] = useState<number | string>(lastStatus);
    const webhookStatus = setUpWebhookStatus(lastResponseStatus, t);

    const { itemRef, handleContextMenuClick, handleContextMenuCapture } = useContextMenuClick<HTMLDivElement>();

    const deletes = useSelector((state: CombinedState) => state.webhooks.activities.deletes);
    const deleted = webhookInstance.id in deletes ? deletes[webhookInstance.id] : false;

    const eventsList = getSelectedGroups(events, webhookEvents).join(', ');

    const onPing = useCallback((): void => {
        setPingFetching(true);
        webhookInstance.ping().then((deliveryInstance: any) => {
            setLastResponseStatus(deliveryInstance.statusCode ? deliveryInstance.statusCode : t('Timeout'));
        }).finally(() => {
            setPingFetching(false);
        });
    }, [webhookInstance, t]);

    const rowClassName = `cvat-webhooks-list-item${selected ? ' cvat-item-selected' : ''}`;

    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    const row = (
        <Row
            ref={itemRef}
            className={rowClassName}
            style={deleted ? { opacity: 0.5, pointerEvents: 'none' } : {}}
            onClick={onClick}
            onContextMenuCapture={handleContextMenuCapture}
        >
            <Col span={1}>
                {
                    webhookStatus.message ? (
                        <CVATTooltip title={webhookStatus.message} overlayStyle={{ maxWidth: '300px' }}>
                            <svg height='24' width='24' className={webhookStatus.className}>
                                <circle cx='12' cy='12' r='5' strokeWidth='0' />
                            </svg>
                        </CVATTooltip>
                    ) : (
                        <svg height='24' width='24' className={webhookStatus.className}>
                            <circle cx='12' cy='12' r='5' strokeWidth='0' />
                        </svg>
                    )
                }

            </Col>
            <Col span={6}>
                <Paragraph ellipsis={{
                    tooltip: description,
                    rows: 2,
                }}
                >
                    <Text strong type='secondary' className='cvat-item-webhook-id'>{`#${id}: `}</Text>
                    <Text strong className='cvat-item-webhook-description'>{description}</Text>
                </Paragraph>
                {username && (
                    <>
                        <Text type='secondary'>{t('Created by {{username}} on {{date}}', { username, date: created })}</Text>
                        <br />
                    </>
                )}
                <Text type='secondary'>{t('Last updated {{time}}', { time: updated })}</Text>
            </Col>
            <Col span={6} offset={1}>
                <Paragraph ellipsis={{
                    tooltip: targetURL,
                    rows: 3,
                }}
                >
                    <Text type='secondary' className='cvat-webhook-info-text'>URL:</Text>
                    {targetURL}
                </Paragraph>
            </Col>
            <Col span={6} offset={1}>
                <Paragraph ellipsis={{
                    tooltip: eventsList,
                    rows: 3,
                }}
                >
                    <Text type='secondary' className='cvat-webhook-info-text'>{t('Events')}:</Text>
                    {eventsList}
                </Paragraph>
            </Col>
            <Col span={3}>
                <Row justify='end'>
                    <Col>
                        <Button
                            className='cvat-item-ping-webhook-button'
                            type='primary'
                            disabled={pingFetching}
                            loading={pingFetching}
                            size='large'
                            ghost
                            onClick={onPing}
                        >
                            {t('Ping')}
                        </Button>
                    </Col>
                </Row>
                <Row justify='end'>
                    <Col>
                        <div
                            className='cvat-webhooks-page-actions-button cvat-actions-menu-button'
                            onClick={handleContextMenuClick}
                        >
                            <Text className='cvat-text-color'>{t('Actions')}</Text>
                            <MoreOutlined className='cvat-menu-icon' />
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    );

    return (
        <WebhookActionsMenu
            webhookInstance={webhookInstance}
            dropdownTrigger={['contextMenu']}
            triggerElement={row}
        />
    );
}

export default React.memo(WebhookItem);
