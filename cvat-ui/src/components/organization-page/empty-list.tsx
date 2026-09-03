// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Text from 'antd/lib/typography/Text';
import Empty from 'antd/lib/empty';
import { useTranslation } from 'react-i18next';

function EmptyListComponent(): JSX.Element {
    const { t } = useTranslation('business');
    return (
        <div className='cvat-empty-members-list'>
            <Empty description={<Text strong>{t('No results matched your search...')}</Text>} />
        </div>
    );
}

export default React.memo(EmptyListComponent);
