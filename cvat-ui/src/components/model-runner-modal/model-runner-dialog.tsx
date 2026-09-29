// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import { useTranslation } from 'react-i18next';

import { ThunkDispatch } from 'utils/redux';
import { modelsActions, startInferenceAsync } from 'actions/models-actions';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import { CombinedState } from 'reducers';
import MLModel from 'cvat-core/src/ml-model';
import { getCore, Task } from 'cvat-core-wrapper';
import DetectorRunner from './detector-runner';

const core = getCore();

interface StateToProps {
    visible: boolean;
    task: any;
    detectors: MLModel[];
    reid: MLModel[];
}

interface DispatchToProps {
    runInference(task: any, model: MLModel, body: object): void;
    closeDialog(): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const { models } = state;
    const { detectors, reid } = models;

    return {
        visible: models.modelRunnerIsVisible,
        task: models.modelRunnerTask,
        reid,
        detectors,
    };
}

function mapDispatchToProps(dispatch: ThunkDispatch): DispatchToProps {
    return {
        runInference(taskID: number, model: MLModel, body: object) {
            dispatch(startInferenceAsync(taskID, model, body));
        },
        closeDialog() {
            dispatch(modelsActions.closeRunModelDialog());
        },
    };
}

function ModelRunnerDialog(props: StateToProps & DispatchToProps): JSX.Element {
    const { t } = useTranslation('business');
    const {
        reid, detectors, task, visible, runInference, closeDialog,
    } = props;

    const models = [...reid, ...detectors];
    const [taskInstance, setTaskInstance] = useState<Task | null>(null);

    useEffect(() => {
        if (task) {
            core.tasks.get({ id: task.id }).then(([_task]: Task[]) => {
                if (_task) {
                    setTaskInstance(_task);
                }
            }).catch((error: any) => {
                notification.error({ message: t('Could not get task details'), description: error.toString() });
            });
        }
    }, [visible, task]);

    return (
        <Modal
            destroyOnClose
            open={visible}
            footer={[]}
            onCancel={(): void => closeDialog()}
            maskClosable
            title={t('Automatic annotation')}
        >
            { taskInstance ? (
                <DetectorRunner
                    withCleanup
                    models={models}
                    labels={taskInstance.labels}
                    dimension={taskInstance.dimension}
                    runInference={(...args) => {
                        closeDialog();
                        runInference(taskInstance.id, ...args);
                    }}
                />
            ) : <CVATLoadingSpinner /> }
        </Modal>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ModelRunnerDialog);
