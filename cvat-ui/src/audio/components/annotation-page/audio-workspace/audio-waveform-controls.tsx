// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'antd/lib/button';
import { AimOutlined } from '@ant-design/icons';

import CVATTooltip from 'components/common/cvat-tooltip';

interface Props {
    centerPlaybackPosition(): void;
}

function AudioWaveformControls({
    centerPlaybackPosition,
}: Props): JSX.Element {
    const { t } = useTranslation('business');
    const centerLabel = t('Center waveform on playback position');

    return (
        <div className='cvat-audio-waveform-controls'>
            <CVATTooltip title={centerLabel} placement='left'>
                <Button
                    className='cvat-audio-btn'
                    type='text'
                    size='small'
                    icon={<AimOutlined />}
                    aria-label={centerLabel}
                    onClick={centerPlaybackPosition}
                />
            </CVATTooltip>
        </div>
    );
}

export default React.memo(AudioWaveformControls);
