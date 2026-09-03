// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback } from 'react';
import Button from 'antd/lib/button';
import { useDispatch } from 'react-redux';
import { selectionActions } from 'actions/selection-actions';
import { useTranslation } from 'react-i18next';

interface ResourceSelectionInfoProps {
    selectedCount: number;
    onSelectAll?: () => void;
}

export function ResourceSelectionInfo(
    { selectedCount, onSelectAll }: Readonly<ResourceSelectionInfoProps>,
): JSX.Element | null {
    const dispatch = useDispatch();
    const { t } = useTranslation('business');

    const handleDeselectAll = useCallback(() => {
        dispatch(selectionActions.clearSelectedResources());
    }, [dispatch]);

    if (selectedCount <= 1 && !onSelectAll) return null;

    let actionButton = null;
    if (onSelectAll && selectedCount === 0) {
        actionButton = (
            <Button
                className='cvat-resource-select-all-button'
                onClick={onSelectAll}
                size='small'
                type='link'
            >
                {t('Select all')}
            </Button>
        );
    } else if (selectedCount > 0) {
        actionButton = (
            <Button
                className='cvat-resource-deselect-button'
                onClick={handleDeselectAll}
                onMouseDown={(e) => e.stopPropagation()}
                size='small'
                type='link'
            >
                {t('Deselect')}
            </Button>
        );
    }

    return (
        <span className='cvat-resource-selection-info'>
            {actionButton}
            {selectedCount > 1 && (
                <span className='cvat-resource-selection-count'>
                    {t('Selected: {{count}}', { count: selectedCount })}
                </span>
            )}
        </span>
    );
}
