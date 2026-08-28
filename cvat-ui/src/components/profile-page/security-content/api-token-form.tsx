// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import dayjs from 'dayjs';

import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import DatePicker from 'antd/lib/date-picker';
import Checkbox from 'antd/lib/checkbox';
import Button from 'antd/lib/button';
import { Row, Col } from 'antd/lib/grid';
import Typography from 'antd/lib/typography';
import { useTranslation } from 'react-i18next';

import { ApiTokenModifiableFields, ApiToken } from 'cvat-core-wrapper';

interface Props {
    onSubmit: (data: ApiTokenModifiableFields) => void;
    onCancel: () => void;
    submitting: boolean;
    token: ApiToken | null;
    tokenCount: number;
}

interface FormData {
    name: string;
    expirationDate: dayjs.Dayjs | null;
    isReadOnly: boolean;
}

function ApiTokenForm({
    onSubmit, onCancel, submitting, token, tokenCount,
}: Props): JSX.Element {
    const { t } = useTranslation('business');
    const [form] = Form.useForm<FormData>();
    const isEditing = !!token;

    const handleSubmit = async (): Promise<void> => {
        try {
            const values = await form.validateFields();
            onSubmit({
                name: values.name,
                expiryDate: values.expirationDate ? values.expirationDate.toISOString() : null,
                readOnly: values.isReadOnly,
            });
        } catch (_error) {
            // Form validation failed
        }
    };

    const getInitialExpirationDate = (): dayjs.Dayjs | null => {
        if (isEditing) {
            return token?.expiryDate ? dayjs.utc(token.expiryDate).local() : null;
        }
        return dayjs().add(1, 'year');
    };

    const initialValues = {
        name: token?.name || (tokenCount === 0 ? t('New token') : t('New token {{number}}', { number: tokenCount + 1 })),
        expirationDate: getInitialExpirationDate(),
        isReadOnly: token?.readOnly || false,
    };

    return (
        <Form
            form={form}
            layout='vertical'
            className='cvat-api-token-form'
            initialValues={initialValues}
        >
            <Typography.Title level={5}>
                {isEditing ? t('Edit API Token') : t('Create API Token')}
            </Typography.Title>
            <Form.Item
                className='cvat-api-token-form-name'
                label={t('Token Name')}
                name='name'
                rules={[
                    { required: true, message: t('Please enter a token name') },
                    { min: 3, message: t('Token name must be at least 3 characters') },
                    { max: 50, message: t('Token name must not exceed 50 characters') },
                ]}
            >
                <Input placeholder={t('Enter a descriptive name for this token')} allowClear />
            </Form.Item>
            <Form.Item
                className='cvat-api-token-form-expiration-date'
                label={t('Expiration Date')}
                name='expirationDate'
                help={t('Leave this field empty if you do not want token to expire')}
            >
                <DatePicker
                    style={{ width: '100%' }}
                    placeholder={t('Select expiration date')}
                    disabledDate={(current) => current && current.valueOf() < Date.now()}
                    format='DD/MM/YYYY'
                />
            </Form.Item>
            <Form.Item
                className='cvat-api-token-form-read-only'
                name='isReadOnly'
                valuePropName='checked'
            >
                <Checkbox>
                    {t('Read-only')}
                </Checkbox>
            </Form.Item>
            <Row gutter={8} justify='end'>
                <Col>
                    <Button
                        className='cvat-api-token-form-cancel'
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        {t('Cancel')}
                    </Button>
                </Col>
                <Col>
                    <Button
                        className='cvat-api-token-form-submit'
                        type='primary'
                        onClick={handleSubmit}
                        loading={submitting}
                    >
                        {isEditing ? t('Update') : t('Save')}
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

export default React.memo(ApiTokenForm);
