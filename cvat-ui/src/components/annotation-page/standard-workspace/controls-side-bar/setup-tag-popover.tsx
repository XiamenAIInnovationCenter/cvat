// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import Text from 'antd/lib/typography/Text';

import LabelSelector from 'components/label-selector/label-selector';
import { PlusOutlined } from '@ant-design/icons';
import CVATTooltip from 'components/common/cvat-tooltip';

interface Props {
    labels: any[];
    selectedLabelID: number | null;
    repeatShapeShortcut: string;
    onChangeLabel(value: string): void;
    onSetup(): void;
}

function SetupTagPopover(props: Props): JSX.Element {
    const { t } = useTranslation('business');
    const {
        labels, selectedLabelID, repeatShapeShortcut, onChangeLabel, onSetup,
    } = props;

    return (
        <div className='cvat-setup-tag-popover-content'>
            <Row justify='start'>
                <Col>
                    <Text className='cvat-text-color' strong>
                        {t('Setup tag')}
                    </Text>
                </Col>
            </Row>
            <Row justify='start'>
                <Col>
                    <Text className='cvat-text-color'>{t('Label')}</Text>
                </Col>
            </Row>
            <Row justify='start'>
                <Col>
                    <LabelSelector
                        labels={labels}
                        value={selectedLabelID}
                        onChange={onChangeLabel}
                        onEnterPress={() => onSetup()}
                    />
                    <CVATTooltip title={t('Press {{shortcut}} to add a tag again', { shortcut: repeatShapeShortcut })}>
                        <Button
                            type='primary'
                            className='cvat-add-tag-button'
                            onClick={() => onSetup()}
                            icon={<PlusOutlined />}
                        />
                    </CVATTooltip>
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(SetupTagPopover);
