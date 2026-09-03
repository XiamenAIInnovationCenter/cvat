// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@ant-design/icons';

import { ZoomIcon } from 'icons';
import { ActiveControl } from 'reducers';
import { Canvas } from 'cvat-canvas-wrapper';
import CVATTooltip from 'components/common/cvat-tooltip';

export interface Props {
    canvasInstance: Canvas;
    activeControl: ActiveControl;
}

function ResizeControl(props: Props): JSX.Element {
    const { t } = useTranslation('business');
    const { activeControl, canvasInstance } = props;

    return (
        <CVATTooltip title={t('Select a region of interest')} placement='right'>
            <Icon
                component={ZoomIcon}
                className={
                    activeControl === ActiveControl.ZOOM_CANVAS ?
                        'cvat-resize-control cvat-active-canvas-control' :
                        'cvat-resize-control'
                }
                onClick={(): void => {
                    if (activeControl === ActiveControl.ZOOM_CANVAS) {
                        canvasInstance.zoomCanvas(false);
                    } else {
                        canvasInstance.cancel();
                        canvasInstance.zoomCanvas(true);
                    }
                }}
            />
        </CVATTooltip>
    );
}

Object.assign(ResizeControl, { displayName: 'ResizeControl' });
export default React.memo(ResizeControl);
