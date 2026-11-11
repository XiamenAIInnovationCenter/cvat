// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RetweetOutlined } from '@ant-design/icons';

import { CombinedState } from 'reducers';
import CVATTooltip from 'components/common/cvat-tooltip';
import GlobalHotKeys from 'utils/mousetrap-react';
import { ShortcutScope } from 'utils/enums';
import { registerComponentShortcutsWithAutoLocalePatch } from 'i18n';
import { subKeyMap } from 'utils/component-subkeymap';

export interface Props {
    loop: boolean;
    loopShortcut: string;
    onLoopChange(loop: boolean): void;
}

const componentShortcuts = {
    TOGGLE_AUDIO_LOOP: {
        name: 'Toggle interval loop playback',
        description: 'Toggle loop playback for the active audio interval',
        sequences: ['r'],
        scope: ShortcutScope.AUDIO_WORKSPACE_CONTROLS,
    },
};

registerComponentShortcutsWithAutoLocalePatch(componentShortcuts);

function LoopControl(props: Props): JSX.Element {
    const { t } = useTranslation('business');
    const { loop, loopShortcut, onLoopChange } = props;
    const { keyMap } = useSelector((state: CombinedState) => state.shortcuts);

    const handler = (): void => {
        onLoopChange(!loop);
    };

    const handlers: Record<keyof typeof componentShortcuts, (event?: KeyboardEvent) => void> = {
        TOGGLE_AUDIO_LOOP: (event?: KeyboardEvent) => {
            if (event) event.preventDefault();
            handler();
        },
    };

    return (
        <>
            <GlobalHotKeys
                keyMap={subKeyMap(componentShortcuts, keyMap)}
                handlers={handlers}
            />
            <CVATTooltip title={t('Loop interval playback{{state}} {{shortcut}}', {
                state: loop ? t(' (on)') : '',
                shortcut: `(${loopShortcut})`,
            })} placement='right'>
                <RetweetOutlined
                    className={
                        loop ?
                            'cvat-active-canvas-control cvat-audio-loop-control' :
                            'cvat-audio-loop-control'
                    }
                    onClick={handler}
                />
            </CVATTooltip>
        </>
    );
}

export default React.memo(LoopControl);
