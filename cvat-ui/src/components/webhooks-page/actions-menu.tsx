// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback } from 'react';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { shallowEqual } from 'utils/redux';
import Dropdown from 'antd/lib/dropdown';
import Modal from 'antd/lib/modal';
import { MenuProps } from 'antd/lib/menu';
import { useTranslation } from 'react-i18next';

import { Webhook } from 'cvat-core-wrapper';
import { CombinedState } from 'reducers';
import { deleteWebhookAsync } from 'actions/webhooks-actions';
import { makeBulkOperationAsync } from 'actions/bulk-actions';

interface WebhookActionsMenuProps {
    webhookInstance: Webhook;
    triggerElement: JSX.Element;
    dropdownTrigger?: ('click' | 'hover' | 'contextMenu')[];
}

export default function WebhookActionsMenu(props: Readonly<WebhookActionsMenuProps>): JSX.Element | null {
    const { t } = useTranslation('business');
    const { webhookInstance, triggerElement, dropdownTrigger } = props;

    const history = useHistory();
    const dispatch = useDispatch();

    const {
        selectedIds,
        allWebhooks,
    } = useSelector((state: CombinedState) => ({
        selectedIds: state.webhooks.selected,
        allWebhooks: state.webhooks.current,
    }), shallowEqual);

    const isBulk = selectedIds.length > 1;
    const onEdit = useCallback(() => {
        history.push(`/webhooks/update/${webhookInstance.id}`);
    }, [webhookInstance]);

    const onDelete = useCallback(() => {
        const webhooksToDelete = allWebhooks.filter((webhook) => selectedIds.includes(webhook.id));
        dispatch(makeBulkOperationAsync(
            webhooksToDelete.length ? webhooksToDelete : [webhookInstance],
            async (webhook) => {
                await dispatch(deleteWebhookAsync(webhook));
            },
            (webhook, idx, total) => t('Deleting webhook #{{id}} ({{current}}/{{total}})', {
                id: webhook.id,
                current: idx + 1,
                total,
            }),
        ));
    }, [dispatch, webhookInstance]);

    const menuItems: MenuProps['items'] = [
        {
            key: 'edit',
            label: t('Edit'),
            onClick: onEdit,
            disabled: isBulk,
        },
        {
            key: 'delete',
            label: isBulk ? t('Delete ({{count}})', { count: selectedIds.length }) : t('Delete'),
            onClick: isBulk ? () => {
                Modal.confirm({
                    title: t('Are you sure you want to remove {{count}} webhooks?', {
                        count: selectedIds.length,
                    }),
                    content: t('They will stop notifying the specified URLs about listed events'),
                    className: 'cvat-modal-confirm-remove-webhook',
                    onOk: () => onDelete(),
                });
            } : () => {
                Modal.confirm({
                    title: t('Are you sure you want to remove the webhook?'),
                    content: t('It will stop notifying the specified URL about listed events'),
                    className: 'cvat-modal-confirm-remove-webhook',
                    onOk: onDelete,
                });
            },
        },
    ];

    return (
        <Dropdown
            trigger={dropdownTrigger || ['click']}
            destroyPopupOnHide
            menu={{
                items: menuItems,
            }}
        >
            {triggerElement}
        </Dropdown>
    );
}
