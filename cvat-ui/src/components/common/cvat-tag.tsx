// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Tag from 'antd/lib/tag';
import { useTranslation } from 'react-i18next';

export enum TagType {
    GROUND_TRUTH = 'ground_truth',
    CONSENSUS = 'consensus',
    PARENT = 'parent',
    REPLICA = 'replica',
}

interface TagProps {
    type: TagType;
}

function CVATTag(props: TagProps): JSX.Element | null {
    const { t } = useTranslation('business');
    const { type } = props;

    switch (type) {
        case TagType.GROUND_TRUTH:
            return <Tag className='cvat-tag-ground-truth' color='#ED9C00'>{t('Ground truth')}</Tag>;
        case TagType.CONSENSUS:
            return <Tag className='cvat-tag-consensus' color='#1890FF'>{t('Consensus')}</Tag>;
        case TagType.PARENT:
            return <Tag className='cvat-tag-parent' color='#1890FF'>{t('Parent')}</Tag>;
        case TagType.REPLICA:
            return <Tag className='cvat-tag-replica' color='#13c2c2'>{t('Replica')}</Tag>;
        default:
            return null;
    }
}

export default React.memo(CVATTag);
