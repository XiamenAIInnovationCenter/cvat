// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useTranslation } from 'react-i18next';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';
import Empty from 'antd/lib/empty';

function EmptyListComponent(): JSX.Element {
    const { t } = useTranslation('business');
    return (
        <div className='cvat-empty-invitations-list'>
            <Empty description={(
                <Row justify='center' align='middle'>
                    <Col>
                        <Text strong>{t('You do not have active invitations')}</Text>
                    </Col>
                </Row>
            )}
            />
        </div>
    );
}

export default React.memo(EmptyListComponent);
