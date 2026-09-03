// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Col, Row } from 'antd/lib/grid';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import './styles.scss';

const { Content } = Layout;

/**
 * Component for displaying message that email should be verified
 */

export default function EmailVerificationSentPage(): JSX.Element {
    const { t } = useTranslation('auth');
    return (
        <Layout>
            <Content>
                <Row justify='center' align='middle' id='email-verification-sent-page-container'>
                    <Col>
                        <h1>{t('Please, confirm your email')}</h1>
                        <Button className='cvat-go-to-login-button' type='link' href='/auth/login'>
                            {t('Go to login page')}
                        </Button>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}
