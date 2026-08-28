// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { shallowEqual } from 'utils/redux';
import {
    Builder, Config, ImmutableTree, JsonLogicTree, Query, Utils as QbUtils, AntdConfig, AntdWidgets,
} from '@react-awesome-query-builder/antd';

import { omit } from 'lodash';
import { DownOutlined } from '@ant-design/icons';
import Popover from 'antd/lib/popover';
import Menu from 'antd/lib/menu';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { CombinedState } from 'reducers';
import { Label } from 'cvat-core-wrapper';
import { changeAnnotationsFilters, fetchAnnotationsAsync, showFilters } from 'actions/annotation-actions';

const { FieldDropdown } = AntdWidgets;

const FILTERS_HISTORY = 'audioAnnotationFiltersHistory';
const defaultTree = QbUtils.loadTree({ type: 'group', id: QbUtils.uuid() });

interface StoredFilter {
    id: string;
    logic: JsonLogicTree;
}

const adjustName = (name: string): string => name.replace(/\./g, '∙');

const getAttributesSubfields = (labels: Label[]): Record<string, any> => {
    const subfields: Record<string, any> = {};
    labels.forEach((label: any): void => {
        const adjustedLabelName = adjustName(label.name);
        subfields[adjustedLabelName] = {
            type: '!struct',
            label: label.name,
            subfields: {},
        };

        const labelSubfields = subfields[adjustedLabelName].subfields;
        label.attributes.forEach((attr: any): void => {
            const adjustedAttrName = adjustName(attr.name);
            labelSubfields[adjustedAttrName] = {
                label: attr.name,
                type: ((): string => {
                    switch (attr.inputType) {
                        case 'checkbox': return 'boolean';
                        case 'radio': return 'select';
                        default: return attr.inputType;
                    }
                })(),
            };
            if (labelSubfields[adjustedAttrName].type === 'select') {
                labelSubfields[adjustedAttrName] = {
                    ...labelSubfields[adjustedAttrName],
                    fieldSettings: {
                        listValues: attr.values,
                    },
                };
            }
        });
    });

    return subfields;
};

function AudioFiltersModalComponent(): JSX.Element {
    const { t } = useTranslation('business');
    const { labels, activeFilters, visible } = useSelector(
        (state: CombinedState) => ({
            labels: state.annotation.job.labels,
            activeFilters: state.annotation.annotations.filters,
            visible: state.annotation.filtersPanelVisible,
        }),
        shallowEqual,
    );
    const [config, setConfig] = useState<Config>(AntdConfig);

    const dispatch = useDispatch();
    const [immutableTree, setImmutableTree] = useState<ImmutableTree>(defaultTree);
    const [filters, setFilters] = useState([] as StoredFilter[]);

    useEffect(() => {
        const fields: Record<string, any> = {
            label: {
                label: t('Label'),
                type: 'select',
                valueSources: ['value'] as ('value')[],
                fieldSettings: {
                    listValues: labels.map((label: any) => ({
                        value: label.name,
                        title: label.name,
                    })),
                },
            },
            serverID: {
                label: t('ServerID'),
                type: 'number',
                hideForCompare: true,
                fieldSettings: { min: 0 },
            },
            attr: {
                label: t('Attributes'),
                type: '!struct',
                subfields: getAttributesSubfields(labels),
                fieldSettings: {
                    treeSelectOnlyLeafs: true,
                },
            },
            duration: {
                label: t('Duration (ms)'),
                type: 'number',
                fieldSettings: { min: 0 },
            },
            start: {
                label: t('Start (ms)'),
                type: 'number',
                fieldSettings: { min: 0 },
            },
            end: {
                label: t('End (ms)'),
                type: 'number',
                fieldSettings: { min: 0 },
            },
            source: {
                label: t('Source'),
                type: 'select',
                fieldSettings: {
                    listValues: [
                        { value: 'manual', title: t('manual') },
                        { value: 'auto', title: t('auto') },
                        { value: 'consensus', title: t('consensus') },
                        { value: 'semi-auto', title: t('semi-auto') },
                        { value: 'file', title: t('file') },
                    ],
                },
            },
        };

        const initialConfig = {
            ...AntdConfig,
            fields,
            settings: {
                ...AntdConfig.settings,
                renderField: (_props) => (
                    <FieldDropdown {..._props} customProps={omit(_props.customProps, 'showSearch')} />
                ),
            },
        };

        setConfig(initialConfig);
        const filtersHistory = window.localStorage.getItem(FILTERS_HISTORY)?.trim() || '[]';
        try {
            setFilters(JSON.parse(filtersHistory));
        } catch (_) {
            setFilters([]);
        }
    }, [labels, t]);

    useEffect(() => {
        window.localStorage.setItem(FILTERS_HISTORY, JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        if (visible) {
            try {
                if (activeFilters.length) {
                    const tree = QbUtils.loadFromJsonLogic(activeFilters[0], config);
                    if (tree) {
                        const treeFromActiveFilters = QbUtils.checkTree(tree, config);
                        setImmutableTree(treeFromActiveFilters);
                    } else {
                        throw new Error();
                    }
                } else {
                    throw new Error();
                }
            } catch (_: any) {
                setImmutableTree(defaultTree);
            }
        }
    }, [visible]);

    const applyFilters = (filtersData: object[]): void => {
        dispatch(changeAnnotationsFilters(filtersData));
        dispatch(fetchAnnotationsAsync());
        dispatch(showFilters(false));
    };

    const confirmModal = (): void => {
        const currentFilter: StoredFilter = {
            id: QbUtils.uuid(),
            logic: QbUtils.jsonLogicFormat(immutableTree, config).logic || {},
        };
        const updatedFilters = filters.filter(
            (filter) => JSON.stringify(filter.logic) !== JSON.stringify(currentFilter.logic),
        );
        setFilters([currentFilter, ...updatedFilters].slice(0, 10));
        applyFilters([currentFilter.logic]);
    };

    const isModalConfirmable = (): boolean => (
        (QbUtils.queryString(immutableTree, config) || '')
            .trim().length > 0 && QbUtils.isValidTree(immutableTree, config)
    );

    const renderBuilder = (builderProps: any): JSX.Element => (
        <div className='query-builder-container'>
            <div className='query-builder'>
                <Builder {...builderProps} />
            </div>
        </div>
    );

    const onChange = (tree: ImmutableTree): void => {
        setImmutableTree(tree);
    };

    const menu = (
        <Menu>
            {filters
                .map((filter: StoredFilter) => {
                    const tree = QbUtils.loadFromJsonLogic(filter.logic, config);
                    if (tree) {
                        const queryString = QbUtils.queryString(tree, config);
                        return { tree, queryString, filter };
                    }

                    return { tree, queryString: null, filter };
                })
                .filter(({ queryString }) => !!queryString)
                .map(({ filter, tree, queryString }) => (
                    <Menu.Item key={filter.id} onClick={() => setImmutableTree(tree as ImmutableTree)}>
                        {queryString}
                    </Menu.Item>
                ))}
        </Menu>
    );

    return (
        <Modal
            className={visible ? 'cvat-filters-modal cvat-filters-modal-visible' : 'cvat-filters-modal'}
            open={visible}
            closable={false}
            width={800}
            destroyOnClose
            centered
            onCancel={() => dispatch(showFilters(false))}
            footer={[
                <Button
                    key='clear'
                    disabled={!activeFilters.length}
                    onClick={() => applyFilters([])}
                    className='cvat-filters-modal-clear-button'
                >
                    {t('Clear filters')}
                </Button>,
                <Button
                    key='cancel'
                    onClick={() => dispatch(showFilters(false))}
                    className='cvat-filters-modal-cancel-button'
                >
                    {t('Cancel')}
                </Button>,
                <Button
                    key='submit'
                    type='primary'
                    disabled={!isModalConfirmable()}
                    onClick={confirmModal}
                    className='cvat-filters-modal-submit-button'
                >
                    {t('Submit')}
                </Button>,
            ]}
        >
            <div
                key='used'
                className='cvat-recently-used-filters-wrapper'
                style={{ display: filters.length ? 'inline-block' : 'none' }}
            >
                <Popover
                    destroyTooltipOnHide
                    trigger='click'
                    placement='top'
                    overlayInnerStyle={{ padding: 0 }}
                    overlayClassName='cvat-recently-used-filters-dropdown'
                    content={menu}
                >
                    <Button
                        type='text'
                        className='cvat-filters-modal-recently-used-button'
                    >
                        {t('Recently used')}
                        {' '}
                        <DownOutlined />
                    </Button>
                </Popover>
            </div>
            { !!config.fields && (
                <Query
                    {...config}
                    value={immutableTree as ImmutableTree}
                    onChange={onChange}
                    renderBuilder={renderBuilder}
                />
            )}
        </Modal>
    );
}

export default React.memo(AudioFiltersModalComponent);
