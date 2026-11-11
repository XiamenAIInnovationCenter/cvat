// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useTranslation } from 'react-i18next';

interface NameTemplateTooltipProps {
    example: string;
}

function NameTemplateTooltip({ example }: NameTemplateTooltipProps): JSX.Element {
    const { t } = useTranslation('business');

    return (
        <>
            {t('You can use in the template:')}
            <ul style={{ marginBottom: 0 }}>
                <li>
                    <code>{'{{id}}'}</code>
                    <br />
                    {t(' - resource ID')}
                </li>
                <li>
                    <code>{'{{name}}'}</code>
                    <br />
                    {t(' - resource name')}
                </li>
                <li>
                    <code>{'{{index}}'}</code>
                    <br />
                    {t(' - index in selection')}
                </li>
            </ul>
            <div>
                {t('Example: ')}
                <br />
                <i>{example}</i>
            </div>
        </>
    );
}

export default React.memo(NameTemplateTooltip);
