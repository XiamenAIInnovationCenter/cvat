// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CombinedState } from 'reducers';

function CVATLogo(): JSX.Element {
    const { t } = useTranslation('base');
    const logo = useSelector((state: CombinedState) => state.about.server.logoURL);

    return (
        <div className='cvat-logo-icon'>
            <img src={logo} alt={t('CVAT Logo')} />
        </div>
    );
}

export default React.memo(CVATLogo);
