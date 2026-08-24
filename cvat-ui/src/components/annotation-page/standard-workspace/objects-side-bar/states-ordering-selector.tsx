// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Col } from 'antd/lib/grid';
import Select from 'antd/lib/select';
import Text from 'antd/lib/typography/Text';
import { useTranslation } from 'react-i18next';

import { StatesOrdering } from 'reducers';

interface StatesOrderingSelectorComponentProps {
    statesOrdering: StatesOrdering;
    changeStatesOrdering(value: StatesOrdering): void;
}

function StatesOrderingSelectorComponent(props: StatesOrderingSelectorComponentProps): JSX.Element {
    const { t } = useTranslation('business');
    const { statesOrdering, changeStatesOrdering } = props;

    return (
        <Col>
            <Text>{t('Sort by')}</Text>
            <Select
                size='small'
                className='cvat-objects-sidebar-ordering-selector'
                popupClassName='cvat-objects-sidebar-ordering-dropdown'
                value={statesOrdering}
                onChange={changeStatesOrdering}
            >
                <Select.Option key={StatesOrdering.ID_DESCENT} value={StatesOrdering.ID_DESCENT}>
                    {t(StatesOrdering.ID_DESCENT)}
                </Select.Option>
                <Select.Option key={StatesOrdering.ID_ASCENT} value={StatesOrdering.ID_ASCENT}>
                    {t(StatesOrdering.ID_ASCENT)}
                </Select.Option>
                <Select.Option key={StatesOrdering.UPDATED} value={StatesOrdering.UPDATED}>
                    {t(StatesOrdering.UPDATED)}
                </Select.Option>
                <Select.Option key={StatesOrdering.Z_ORDER} value={StatesOrdering.Z_ORDER}>
                    {t(StatesOrdering.Z_ORDER)}
                </Select.Option>
            </Select>
        </Col>
    );
}

export default React.memo(StatesOrderingSelectorComponent);
