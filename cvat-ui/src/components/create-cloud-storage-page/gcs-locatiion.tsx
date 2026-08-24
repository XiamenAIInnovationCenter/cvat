// Copyright (C) 2021-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import config from 'config';
import { useTranslation } from 'react-i18next';
import Location from './location';

interface Props {
    selectedRegion: any;
    onSelectRegion: any;
    internalCommonProps: any;
}

export default function GCSLocation(props: Props): JSX.Element {
    const { t } = useTranslation('business');
    const {
        selectedRegion,
        onSelectRegion,
        internalCommonProps,
    } = props;
    return (
        <Location
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            internalCommonProps={internalCommonProps}
            values={config.DEFAULT_GOOGLE_CLOUD_STORAGE_LOCATIONS}
            name='location'
            label={t('Location')}
            href='https://cloud.google.com/storage/docs/locations#available-locations'
        />
    );
}
