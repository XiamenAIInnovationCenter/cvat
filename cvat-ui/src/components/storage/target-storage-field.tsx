// (Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React from 'react';
import { StorageLocation } from 'reducers';
import { StorageData } from 'cvat-core-wrapper';
import { useTranslation } from 'react-i18next';
import StorageWithSwitchField from './storage-with-switch-field';

export interface Props {
    instanceId: number | null;
    locationValue: StorageLocation;
    switchDescription?: string;
    switchHelpMessage?: string;
    storageDescription?: string;
    useDefaultStorage?: boolean | null;
    onChangeLocationValue?: (value: StorageLocation) => void;
    onChangeStorage?: (values: StorageData) => void;
    onChangeUseDefaultStorage?: (value: boolean) => void;
}

export default function TargetStorageField(props: Props): JSX.Element {
    const { t } = useTranslation('business');
    const {
        instanceId,
        locationValue,
        switchDescription,
        switchHelpMessage,
        storageDescription,
        useDefaultStorage,
        onChangeLocationValue,
        onChangeUseDefaultStorage,
        onChangeStorage,
    } = props;

    return (
        <StorageWithSwitchField
            instanceId={instanceId}
            locationValue={locationValue}
            storageLabel={t('Target storage')}
            storageName='targetStorage'
            switchName='useProjectTargetStorage'
            useDefaultStorage={useDefaultStorage}
            switchDescription={switchDescription}
            switchHelpMessage={switchHelpMessage}
            storageDescription={storageDescription}
            onChangeUseDefaultStorage={onChangeUseDefaultStorage}
            onChangeStorage={onChangeStorage}
            onChangeLocationValue={onChangeLocationValue}
        />
    );
}
