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

export default function S3Region(props: Props): JSX.Element {
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
            values={config.DEFAULT_AWS_S3_REGIONS}
            name='region'
            label={t('Region')}
            href='https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions'
        />
    );
}
