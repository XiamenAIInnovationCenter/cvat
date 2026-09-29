// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { Col, Row } from 'antd/lib/grid';
import Card from 'antd/lib/card';
import Typography from 'antd/lib/typography';
import Button from 'antd/lib/button';
import { useTranslation } from 'react-i18next';

import { ChangePasswordData } from 'reducers';
import { changePasswordAsync } from 'actions/auth-actions';
import ChangePasswordForm from './change-password-form';

function PasswordChangeCard(): JSX.Element {
    const { t } = useTranslation('business');
    const dispatch = useDispatch();
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const onShowPasswordForm = useCallback((): void => {
        setShowPasswordForm(true);
    }, []);

    const onCancelPasswordForm = useCallback((): void => {
        setShowPasswordForm(false);
    }, []);

    const onChangePassword = (data: ChangePasswordData): void => {
        dispatch(changePasswordAsync(data, onCancelPasswordForm));
    };

    return (
        <Card
            title={t('Password')}
            className='cvat-security-password-card'
            style={{ marginBottom: 16 }}
        >
            {showPasswordForm ? (
                <ChangePasswordForm onSubmit={onChangePassword} onCancel={onCancelPasswordForm} />
            ) : (
                <Row justify='space-between' align='middle'>
                    <Col>
                        <Typography.Text type='secondary'>
                            {t('Keep your account secure by using a strong password.')}
                        </Typography.Text>
                    </Col>
                    <Col>
                        <Button className='cvat-security-password-change-button' onClick={onShowPasswordForm} type='primary'>
                            {t('Change password')}
                        </Button>
                    </Col>
                </Row>
            )}
        </Card>
    );
}

export default React.memo(PasswordChangeCard);
