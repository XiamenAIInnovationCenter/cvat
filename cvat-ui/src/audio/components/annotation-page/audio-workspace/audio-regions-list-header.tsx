// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd/lib/grid';
import Text from 'antd/lib/typography/Text';
import Select from 'antd/lib/select';
import {
    EyeInvisibleFilled, EyeOutlined, LockFilled, UnlockOutlined,
    PushpinFilled, PushpinOutlined,
} from '@ant-design/icons';

import CVATTooltip from 'components/common/cvat-tooltip';

export enum AudioRegionsOrdering {
    INSERTION = 'Insertion order',
    START_TIME = 'Start time',
    LABEL_NAME = 'Label name',
}

interface Props {
    count: number;
    ordering: AudioRegionsOrdering;
    allLocked: boolean;
    allPinned: boolean;
    allHidden: boolean;
    switchLockAllShortcut: string;
    switchPinAllShortcut: string;
    switchHiddenAllShortcut: string;
    onChangeOrdering(value: AudioRegionsOrdering): void;
    onLockAll(): void;
    onUnlockAll(): void;
    onPinAll(): void;
    onUnpinAll(): void;
    onHideAll(): void;
    onShowAll(): void;
}

function AudioRegionsListHeader(props: Props): JSX.Element {
    const { t } = useTranslation('business');
    const {
        count,
        ordering,
        allLocked,
        allPinned,
        allHidden,
        switchLockAllShortcut,
        switchPinAllShortcut,
        switchHiddenAllShortcut,
        onChangeOrdering,
        onLockAll,
        onUnlockAll,
        onPinAll,
        onUnpinAll,
        onHideAll,
        onShowAll,
    } = props;

    return (
        <div className='cvat-audio-regions-list-header'>
            <Row justify='space-between' align='middle'>
                <Col>
                    <Text>{t('Items: {{count}}', { count })}</Text>
                </Col>
                <Col className='cvat-audio-regions-list-header-actions'>
                    <CVATTooltip title={t('Switch lock for all {{shortcut}}', { shortcut: switchLockAllShortcut })}>
                        {allLocked ? (
                            <LockFilled onClick={onUnlockAll} />
                        ) : (
                            <UnlockOutlined onClick={onLockAll} />
                        )}
                    </CVATTooltip>
                    <CVATTooltip title={t('Switch pin for all {{shortcut}}', { shortcut: switchPinAllShortcut })}>
                        {allPinned ? (
                            <PushpinFilled onClick={onUnpinAll} />
                        ) : (
                            <PushpinOutlined onClick={onPinAll} />
                        )}
                    </CVATTooltip>
                    <CVATTooltip title={t('Switch hidden for all {{shortcut}}', { shortcut: switchHiddenAllShortcut })}>
                        {allHidden ? (
                            <EyeInvisibleFilled onClick={onShowAll} />
                        ) : (
                            <EyeOutlined onClick={onHideAll} />
                        )}
                    </CVATTooltip>
                </Col>
            </Row>
            <Row className='cvat-audio-regions-list-ordering' align='middle'>
                <Text>{t('Sort by')}</Text>
                <Select
                    size='small'
                    className='cvat-audio-regions-list-ordering-selector'
                    value={ordering}
                    onChange={onChangeOrdering}
                >
                    {Object.values(AudioRegionsOrdering).map((value) => (
                        <Select.Option key={value} value={value}>
                            {t(value)}
                        </Select.Option>
                    ))}
                </Select>
            </Row>
        </div>
    );
}

export default React.memo(AudioRegionsListHeader);
