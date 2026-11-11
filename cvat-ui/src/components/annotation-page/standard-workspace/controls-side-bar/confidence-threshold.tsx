// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import ReactDOM from 'react-dom';
import Text from 'antd/lib/typography/Text';
import Slider from 'antd/lib/slider';
import { Col, Row } from 'antd/lib/grid';
import { useTranslation } from 'react-i18next';

interface Props {
    thresholdValue: number;
    onChange(value: number): void;
}

export const MIN_THRESHOLD = 0.2;
export const MAX_THRESHOLD = 0.9;

function ConfidenceThreshold(props: Props): React.ReactPortal | null {
    const { t } = useTranslation('business');
    const { thresholdValue, onChange } = props;
    const target = window.document.getElementsByClassName('cvat-canvas-container')[0];

    return target ?
        ReactDOM.createPortal(
            <Row align='middle' className='cvat-interactor-threshold-wrapper'>
                <Col span={24}>
                    <Slider
                        value={thresholdValue}
                        min={MIN_THRESHOLD}
                        max={MAX_THRESHOLD}
                        step={0.01}
                        tooltip={{
                            open: false,
                        }}
                        onChange={onChange}
                    />
                </Col>
                <Text type='secondary'>{t('Minimum confidence filter')}</Text>
            </Row>,
            target,
        ) :
        null;
}

export default React.memo(ConfidenceThreshold);
