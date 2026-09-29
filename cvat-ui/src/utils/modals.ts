// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import Modal from 'antd/lib/modal';
import i18n from 'i18n';

import { Organization, Project, Task } from 'cvat-core-wrapper';

export function confirmTransferModal(
    instances: Project[] | Task[],
    activeWorkspace: Organization | null,
    dstWorkspace: Organization | null,
    onOk: () => void,
): void {
    const first = instances[0];
    if (!first) {
        return;
    }

    const instanceType = first instanceof Task ? 'task' : 'project';
    const localizedInstanceType = i18n.t(instanceType, { ns: 'business' });
    const movingItems = instances.length > 1 ?
        i18n.t('{{count}} {{type}}', {
            count: instances.length, type: localizedInstanceType, ns: 'business',
        }) : i18n.t('{{type}} #{{id}}', {
            type: localizedInstanceType, id: first.id, ns: 'business',
        });
    const destination = dstWorkspace ?
        i18n.t('organization {{slug}}', { slug: dstWorkspace.slug, ns: 'business' }) :
        i18n.t('personal workspace', { ns: 'business' });
    let details = i18n.t('You are going to move {{items}} to {{destination}}. ', {
        items: movingItems, destination, ns: 'business',
    });
    if (activeWorkspace) {
        details += i18n.t(
            instances.length > 1 ?
                'Organization members will lose access to these resources.' :
                'Organization members will lose access to this resource.',
            { ns: 'business' },
        );
    }

    Modal.confirm({
        title: i18n.t('Data transfer between workspaces', { ns: 'business' }),
        content: `${details} ${i18n.t('Would you like to proceed?', { ns: 'business' })}`,
        className: 'cvat-modal-confirm-project-transfer-between-workspaces',
        onOk,
        okButtonProps: {
            type: 'primary',
            danger: true,
        },
        okText: i18n.t('Continue', { ns: 'business' }),
    });
}
