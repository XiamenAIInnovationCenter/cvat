// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { shallowEqual } from 'utils/redux';
import type { Key } from 'react';

import { Col, Row } from 'antd/lib/grid';
import Card from 'antd/lib/card';
import Button from 'antd/lib/button';
import Tag from 'antd/lib/tag';
import Dropdown from 'antd/lib/dropdown';
import Modal from 'antd/lib/modal';
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import {
    MoreOutlined, PlusOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';
import type { ColumnType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';

import { CombinedState } from 'reducers';
import { ApiToken, ApiTokenModifiableFields } from 'cvat-core-wrapper';
import {
    createApiTokenAsync, getApiTokensAsync,
    updateApiTokenAsync, revokeApiTokenAsync,
} from 'actions/auth-actions';
import CVATTable from 'components/common/cvat-table';
import CVATTooltip from 'components/common/cvat-tooltip';
import ApiTokenForm from './api-token-form';
import ApiTokenCreatedModal from './api-token-created-modal';

interface RowData {
    key: number;
    name: string;
    readOnly: boolean;
    createdDate: string;
    expiryDate: string | null;
    lastUsedDate: string | null;
    token: ApiToken;
}

function ApiTokensCard(): JSX.Element {
    const { t } = useTranslation('business');
    const dispatch = useDispatch();
    const [showCreateTokenForm, setShowCreateTokenForm] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [newToken, setNewToken] = useState<ApiToken | null>(null);
    const [editingToken, setEditingToken] = useState<ApiToken | null>(null);

    const { apiTokens, fetching, tokenCount } = useSelector((state: CombinedState) => ({
        apiTokens: state.auth.apiTokens.current,
        fetching: state.auth.apiTokens.fetching,
        tokenCount: state.auth.apiTokens.count,
    }), shallowEqual);

    const tableData: RowData[] = apiTokens.map((token: ApiToken) => ({
        key: token.id,
        name: token.name,
        readOnly: token.readOnly,
        createdDate: token.createdDate,
        expiryDate: token.expiryDate,
        lastUsedDate: token.lastUsedDate,
        token,
    }));

    useEffect(() => {
        dispatch(getApiTokensAsync());
    }, [dispatch]);

    const onShowCreateTokenForm = useCallback((): void => {
        setShowCreateTokenForm(true);
    }, []);

    const onCancelCreateTokenForm = useCallback((): void => {
        setShowCreateTokenForm(false);
        setEditingToken(null);
    }, []);

    const onEditToken = useCallback((token: ApiToken): void => {
        setEditingToken(token);
        setShowCreateTokenForm(true);
    }, []);

    const onRevokeToken = useCallback((token: ApiToken): void => {
        Modal.confirm({
            title: t('Revoke API Token'),
            content: t('Are you sure you want to revoke the token "{{name}}"? This action cannot be undone.', {
                name: token.name,
            }),
            okText: t('Revoke'),
            okButtonProps: {
                type: 'primary',
                danger: true,
                className: 'cvat-api-token-revoke-button',
            },
            cancelText: t('Cancel'),
            onOk: () => {
                dispatch(revokeApiTokenAsync(token, () => {
                    dispatch(getApiTokensAsync());
                }));
            },
            className: 'cvat-modal-confirm-revoke-token',
        });
    }, [dispatch, t]);

    const onSubmitTokenForm = async (data: ApiTokenModifiableFields): Promise<void> => {
        if (editingToken) {
            dispatch(updateApiTokenAsync(editingToken, data, () => {
                setShowCreateTokenForm(false);
                setEditingToken(null);
                dispatch(getApiTokensAsync());
            }));
        } else {
            dispatch(createApiTokenAsync(data, (token) => {
                if (token.value) {
                    setNewToken(token);
                    setShowTokenModal(true);
                }

                setShowCreateTokenForm(false);
                dispatch(getApiTokensAsync());
            }));
        }
    };

    const onCloseTokenModal = useCallback((): void => {
        setShowTokenModal(false);
        setNewToken(null);
    }, []);

    const apiTokenColumns: ColumnType<RowData>[] = [
        {
            title: t('Name'),
            dataIndex: 'name',
            key: 'name',
            width: 250,
            sorter: (a: RowData, b: RowData) => a.name.localeCompare(b.name),
            className: 'cvat-api-token-name',
        },
        {
            title: t('Permissions'),
            dataIndex: 'readOnly',
            key: 'readOnly',
            align: 'center' as const,
            sorter: (a: RowData, b: RowData) => {
                if (a.readOnly === b.readOnly) return 0;
                return a.readOnly ? -1 : 1;
            },
            filters: [
                { text: t('Read Only'), value: true },
                { text: t('Read/Write'), value: false },
            ],
            onFilter: (value: boolean | Key, record: RowData) => record.readOnly === value,
            render: (readOnly: boolean) => (
                <Tag color={readOnly ? 'blue' : 'orange'}>
                    {readOnly ? t('Read Only') : t('Read/Write')}
                </Tag>
            ),
            className: 'cvat-api-token-permissions',
        },
        {
            title: t('Created'),
            dataIndex: 'createdDate',
            key: 'createdDate',
            sorter: (a: RowData, b: RowData) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
            render: (date: string) => new Date(date).toLocaleDateString(),
            className: 'cvat-api-token-created-date',
        },
        {
            title: t('Expires'),
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            sorter: (a: RowData, b: RowData) => {
                if (!a.expiryDate && !b.expiryDate) return 0;
                if (!a.expiryDate) return 1;
                if (!b.expiryDate) return -1;
                return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
            },
            render: (date: string | null) => (
                date ? new Date(date).toLocaleDateString() : <Text underline>{t('Never')}</Text>
            ),
            className: 'cvat-api-token-expire-date',
        },
        {
            title: t('Last Used'),
            dataIndex: 'lastUsedDate',
            key: 'lastUsedDate',
            sorter: (a: RowData, b: RowData) => {
                if (!a.lastUsedDate && !b.lastUsedDate) return 0;
                if (!a.lastUsedDate) return 1;
                if (!b.lastUsedDate) return -1;
                return new Date(a.lastUsedDate).getTime() - new Date(b.lastUsedDate).getTime();
            },
            render: (date: string | null) => (date ? new Date(date).toLocaleDateString() : t('Never')),
            className: 'cvat-api-token-last-used',
        },
        {
            title: t('Actions'),
            key: 'actions',
            align: 'center' as const,
            width: 60,
            render: (row: RowData) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'edit',
                                label: t('Edit'),
                                onClick: () => onEditToken(row.token),
                            },
                            { type: 'divider' },
                            {
                                key: 'revoke',
                                label: t('Revoke'),
                                onClick: () => onRevokeToken(row.token),
                            },
                        ],
                    }}
                    className='cvat-api-token-actions-menu'
                    trigger={['click']}
                >
                    <Button type='text' icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <>
            <Card
                title={(
                    <Row className='cvat-security-api-tokens-card-title' justify='space-between'>
                        <Col>
                            <Title level={5}>{t('Personal Access Tokens (PATs)')}</Title>
                            <CVATTooltip
                                title={(
                                    <Row className='cvat-api-tokens-tooltip-inner'>
                                        <Row>
                                            <Col>
                                                <Text>{t('Personal Access Tokens help')}</Text>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Text>{t('Personal Access Tokens security help')}</Text>
                                            </Col>
                                        </Row>
                                    </Row>
                                )}
                                overlayStyle={{ maxWidth: 400 }}
                            >
                                <QuestionCircleOutlined style={{ opacity: 0.5 }} />
                            </CVATTooltip>
                        </Col>
                        <Col>
                            <Button
                                type='primary'
                                icon={<PlusOutlined />}
                                onClick={onShowCreateTokenForm}
                                className='cvat-create-api-token-button'
                            />
                        </Col>
                    </Row>
                )}
                className='cvat-security-api-tokens-card'
            >
                {showCreateTokenForm ? (
                    <ApiTokenForm
                        onSubmit={onSubmitTokenForm}
                        onCancel={onCancelCreateTokenForm}
                        submitting={fetching}
                        token={editingToken}
                        tokenCount={tokenCount}
                    />
                ) : (
                    <CVATTable
                        tableTitle={<Title level={5}>{t('Existing Tokens')}</Title>}
                        className='cvat-api-tokens-table'
                        csvExport={{ filename: 'access_tokens.csv' }}
                        columns={apiTokenColumns}
                        dataSource={tableData}
                        loading={fetching}
                        rowKey='key'
                        size='small'
                        pagination={{
                            showSizeChanger: true,
                            showQuickJumper: true,
                            defaultPageSize: 10,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                    />
                )}
            </Card>
            {newToken && (
                <ApiTokenCreatedModal
                    visible={showTokenModal}
                    token={newToken}
                    onClose={onCloseTokenModal}
                />
            )}
        </>
    );
}

export default React.memo(ApiTokensCard);
