// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React, { useCallback } from 'react';
import Modal from 'antd/lib/modal';
import { LoadingOutlined } from '@ant-design/icons';
import { DimensionType, CVATCore } from 'cvat-core-wrapper';
import Menu, { MenuInfo } from 'components/dropdown-menu';
import { usePlugins } from 'utils/hooks';
import { CombinedState } from 'reducers';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

type AnnotationFormats = Awaited<ReturnType<CVATCore['server']['formats']>>;

interface Props {
    taskID: number;
    projectID: number | null;
    taskMode: string;
    bugTracker: string;
    loaders: AnnotationFormats['loaders'];
    dumpers: AnnotationFormats['dumpers'];
    inferenceIsActive: boolean;
    taskDimension: DimensionType;
    consensusEnabled: boolean;
    onClickMenu: (params: MenuInfo) => void;
}

export enum Actions {
    LOAD_TASK_ANNO = 'load_task_anno',
    EXPORT_TASK_DATASET = 'export_task_dataset',
    DELETE_TASK = 'delete_task',
    RUN_AUTO_ANNOTATION = 'run_auto_annotation',
    MOVE_TASK_TO_PROJECT = 'move_task_to_project',
    OPEN_BUG_TRACKER = 'open_bug_tracker',
    BACKUP_TASK = 'backup_task',
    VIEW_ANALYTICS = 'view_analytics',
    QUALITY_CONTROL = 'quality_control',
    CONSENSUS_MANAGEMENT = 'consensus_management',
    MERGE_CONSENSUS_JOBS = 'merge_consensus_jobs',
}

function ActionsMenuComponent(props: Props): JSX.Element {
    const { t } = useTranslation('business');
    const {
        taskID,
        projectID,
        bugTracker,
        inferenceIsActive,
        consensusEnabled,
        onClickMenu,
    } = props;

    const plugins = usePlugins((state: CombinedState) => state.plugins.components.taskActions.items, props);

    const mergingConsensus = useSelector((state: CombinedState) => state.consensus.actions.merging);
    const isTaskInMergingConsensus = mergingConsensus[`task_${taskID}`];

    const onClickMenuWrapper = useCallback(
        (params: MenuInfo) => {
            if (!params) {
                return;
            }

            if (params.key === Actions.DELETE_TASK) {
                Modal.confirm({
                    title: t('The task {{id}} will be deleted', { id: taskID }),
                    content: t('All related data (images, annotations) will be lost. Continue?'),
                    className: 'cvat-modal-confirm-delete-task',
                    onOk: () => {
                        onClickMenu(params);
                    },
                    okButtonProps: {
                        type: 'primary',
                        danger: true,
                    },
                    okText: t('Delete'),
                });
            } else if (params.key === Actions.MERGE_CONSENSUS_JOBS) {
                Modal.confirm({
                    title: t('The consensus jobs will be merged'),
                    content: t('Existing annotations in parent jobs will be updated. Continue?'),
                    className: 'cvat-modal-confirm-consensus-merge-task',
                    onOk: () => {
                        onClickMenu(params);
                    },
                    okButtonProps: {
                        type: 'primary',
                        danger: true,
                    },
                    okText: t('Merge'),
                });
            } else {
                onClickMenu(params);
            }
        },
        [taskID],
    );

    const menuItems: [JSX.Element, number][] = [];
    menuItems.push([(
        <Menu.Item key={Actions.LOAD_TASK_ANNO}>{t('Upload annotations')}</Menu.Item>
    ), 0]);

    menuItems.push([(
        <Menu.Item key={Actions.EXPORT_TASK_DATASET}>{t('Export task dataset')}</Menu.Item>
    ), 10]);

    if (bugTracker) {
        menuItems.push([(
            <Menu.Item key={Actions.OPEN_BUG_TRACKER}>{t('Open bug tracker')}</Menu.Item>
        ), 20]);
    }

    menuItems.push([(
        <Menu.Item disabled={inferenceIsActive} key={Actions.RUN_AUTO_ANNOTATION}>
            {t('Automatic annotation')}
        </Menu.Item>
    ), 30]);

    menuItems.push([(
        <Menu.Item
            key={Actions.BACKUP_TASK}
        >
            {t('Backup Task')}
        </Menu.Item>
    ), 40]);

    menuItems.push([(
        <Menu.Item
            key={Actions.VIEW_ANALYTICS}
        >
            {t('View analytics')}
        </Menu.Item>
    ), 50]);

    menuItems.push([(
        <Menu.Item
            key={Actions.QUALITY_CONTROL}
        >
            {t('Quality control')}
        </Menu.Item>
    ), 60]);

    if (consensusEnabled) {
        menuItems.push([(
            <Menu.Item
                key={Actions.CONSENSUS_MANAGEMENT}
            >
                {t('Consensus management')}
            </Menu.Item>
        ), 55]);
        menuItems.push([(
            <Menu.Item
                key={Actions.MERGE_CONSENSUS_JOBS}
                disabled={isTaskInMergingConsensus}
                icon={isTaskInMergingConsensus && <LoadingOutlined />}
            >
                {t('Merge consensus jobs')}
            </Menu.Item>
        ), 60]);
    }

    if (projectID === null) {
        menuItems.push([(
            <Menu.Item key={Actions.MOVE_TASK_TO_PROJECT}>{t('Move to project')}</Menu.Item>
        ), 70]);
    }

    menuItems.push([(
        <React.Fragment key={Actions.DELETE_TASK}>
            <Menu.Divider />
            <Menu.Item key={Actions.DELETE_TASK}>{t('Delete')}</Menu.Item>
        </React.Fragment>
    ), 70]);

    menuItems.push(
        ...plugins.map(({ component: Component, weight }, index) => {
            const menuItem = Component({ key: index, targetProps: props });
            return [menuItem, weight] as [JSX.Element, number];
        }),
    );

    return (
        <Menu
            selectable={false}
            className='cvat-actions-menu'
            onClick={onClickMenuWrapper}
        >
            { menuItems.sort((menuItem1, menuItem2) => menuItem1[1] - menuItem2[1])
                .map((menuItem) => menuItem[0]) }
        </Menu>
    );
}

export default React.memo(ActionsMenuComponent);
