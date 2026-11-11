// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Title from 'antd/lib/typography/Title';
import Button from 'antd/lib/button';
import DatePicker from 'antd/lib/date-picker';
import { Row, Col } from 'antd/lib/grid';
import { DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { Project, Task, Job } from 'cvat-core-wrapper';
import ResourceLink from 'components/common/resource-link';

interface Props {
    onExportEvents(): void;
    onUpdateTimePeriod(from: Date | null, to: Date | null): void;
    resource: Project | Task | Job;
    exporting: boolean;
    fetching: boolean;
}

function AnaylyticsPageHeader(props: Props): JSX.Element {
    const { t } = useTranslation('business');
    const {
        onUpdateTimePeriod,
        onExportEvents,
        resource,
        exporting,
        fetching,
    } = props;

    return (
        <Row justify='space-between' align='middle'>
            <Col className='cvat-analytics-header'>
                <Title level={4} className='cvat-text-color'>
                    {t('Analytics for')}
                    {' '}
                    <ResourceLink resource={resource} />
                </Title>
            </Col>
            <Col>
                <DatePicker.RangePicker
                    placeholder={[t('UTC start date'), t('UTC end date')]}
                    className='cvat-analytics-date-picker'
                    onChange={(value) => {
                        if (value) {
                            const [from, to] = value;
                            if (from && to) {
                                onUpdateTimePeriod(from.toDate(), to.toDate());
                            }
                        } else {
                            onUpdateTimePeriod(null, null);
                        }
                    }}
                />
                <Button
                    className='cvat-analytics-export-button'
                    disabled={fetching || exporting}
                    loading={exporting}
                    type='link'
                    icon={<DownloadOutlined />}
                    onClick={onExportEvents}
                >
                    {t('Export events')}
                </Button>
            </Col>
        </Row>
    );
}

export default React.memo(AnaylyticsPageHeader);
