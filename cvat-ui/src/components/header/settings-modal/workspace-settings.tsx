// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';

import { Row, Col } from 'antd/lib/grid';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import InputNumber from 'antd/lib/input-number';
import Text from 'antd/lib/typography/Text';
import Slider from 'antd/lib/slider';
import Select from 'antd/lib/select';
import { useTranslation } from 'react-i18next';

import {
    MAX_ACCURACY,
} from 'components/annotation-page/standard-workspace/controls-side-bar/approximation-accuracy';
import { clamp } from 'utils/math';

interface Props {
    autoSave: boolean;
    autoSaveInterval: number;
    focusedObjectPadding: number;
    showAllInterpolationTracks: boolean;
    showObjectsTextAlways: boolean;
    adaptiveZoom: boolean;
    intelligentPolygonCrop: boolean;
    defaultApproxPolyAccuracy: number;
    textFontSize: number;
    controlPointsSize: number;
    textPosition: 'center' | 'auto';
    textContent: string;
    showTagsOnFrame: boolean;
    onSwitchAutoSave(enabled: boolean): void;
    onChangeAutoSaveInterval(interval: number): void;
    onChangeFocusedObjectPadding(padding: number): void;
    onChangeDefaultApproxPolyAccuracy(approxPolyAccuracy: number): void;
    onSwitchShowingInterpolatedTracks(enabled: boolean): void;
    onSwitchShowingObjectsTextAlways(enabled: boolean): void;
    onSwitchAdaptiveZoom(enabled: boolean): void;
    onSwitchIntelligentPolygonCrop(enabled: boolean): void;
    onChangeTextFontSize(fontSize: number): void;
    onChangeControlPointsSize(pointsSize: number): void;
    onChangeTextPosition(position: 'auto' | 'center'): void;
    onChangeTextContent(textContent: string[]): void;
    onSwitchShowingTagsOnFrame(enabled: boolean): void;
}

function WorkspaceSettingsComponent(props: Props): JSX.Element {
    const {
        autoSave,
        autoSaveInterval,
        focusedObjectPadding,
        showAllInterpolationTracks,
        showObjectsTextAlways,
        adaptiveZoom,
        intelligentPolygonCrop,
        defaultApproxPolyAccuracy,
        textFontSize,
        controlPointsSize,
        textPosition,
        textContent,
        showTagsOnFrame,
        onSwitchAutoSave,
        onChangeAutoSaveInterval,
        onChangeFocusedObjectPadding,
        onSwitchShowingInterpolatedTracks,
        onSwitchShowingObjectsTextAlways,
        onSwitchAdaptiveZoom,
        onSwitchIntelligentPolygonCrop,
        onChangeDefaultApproxPolyAccuracy,
        onChangeTextFontSize,
        onChangeControlPointsSize,
        onChangeTextPosition,
        onChangeTextContent,
        onSwitchShowingTagsOnFrame,
    } = props;

    const { t } = useTranslation('header', { keyPrefix: 'settings.Workspace' });

    const minAutoSaveInterval = 1;
    const maxAutoSaveInterval = 60;
    const minFocusedObjectPadding = 0;
    const maxFocusedObjectPadding = 1000;
    const minControlPointsSize = 2;
    const maxControlPointsSize = 10;

    return (
        <div className='cvat-workspace-settings'>
            <Row className='cvat-player-setting'>
                <Col span={24}>
                    <Checkbox
                        className='cvat-text-color cvat-workspace-settings-auto-save'
                        checked={autoSave}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchAutoSave(event.target.checked);
                        }}
                    >
                        {t('Enable auto save')}
                    </Checkbox>
                </Col>
                <Col className='cvat-workspace-settings-auto-save-interval'>
                    <Text type='secondary'>{t('auto-save-tips.0')}</Text>
                    <InputNumber
                        size='small'
                        min={minAutoSaveInterval}
                        max={maxAutoSaveInterval}
                        step={1}
                        value={Math.round(autoSaveInterval / (60 * 1000))}
                        onChange={(value: number | undefined | string): void => {
                            if (typeof value !== 'undefined') {
                                onChangeAutoSaveInterval(
                                    Math.floor(clamp(+value, minAutoSaveInterval, maxAutoSaveInterval)) * 60 * 1000,
                                );
                            }
                        }}
                    />
                    <Text type='secondary'>{t('auto-save-tips.1')}</Text>
                </Col>
            </Row>
            <Row className='cvat-player-setting'>
                <Col span={12} className='cvat-workspace-settings-show-interpolated'>
                    <Row>
                        <Checkbox
                            className='cvat-text-color'
                            checked={showAllInterpolationTracks}
                            onChange={(event: CheckboxChangeEvent): void => {
                                onSwitchShowingInterpolatedTracks(event.target.checked);
                            }}
                        >
                            {t('show-interpolated')}
                        </Checkbox>
                    </Row>
                    <Row>
                        <Text type='secondary'>{t('show-interpolated-tips')}</Text>
                    </Row>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-show-text-always cvat-player-setting'>
                <Col span={24}>
                    <Checkbox
                        className='cvat-text-color'
                        checked={showObjectsTextAlways}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchShowingObjectsTextAlways(event.target.checked);
                        }}
                    >
                        {t('show-text-always')}
                    </Checkbox>
                </Col>
                <Col span={24}>
                    <Text type='secondary'>
                        {t('show-text-always-tips')}
                    </Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-text-settings cvat-player-setting'>
                <Col span={24}>
                    <Text>{t('text-settings-content')}</Text>
                </Col>
                <Col span={16}>
                    <Select
                        className='cvat-workspace-settings-text-content'
                        mode='multiple'
                        value={textContent.split(',').filter((entry: string) => !!entry)}
                        onChange={onChangeTextContent}
                    >
                        <Select.Option value='id'>{t('text-settings-contents.ID')}</Select.Option>
                        <Select.Option value='label'>{t('text-settings-contents.Label')}</Select.Option>
                        <Select.Option value='attributes'>{t('text-settings-contents.Attributes')}</Select.Option>
                        <Select.Option value='source'>{t('text-settings-contents.Source')}</Select.Option>
                        <Select.Option value='descriptions'>{t('text-settings-contents.Descriptions')}</Select.Option>
                        <Select.Option value='dimensions'>{t('text-settings-contents.Dimensions')}</Select.Option>
                        <Select.Option value='layer'>{t('text-settings-contents.Layer')}</Select.Option>
                    </Select>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-text-settings cvat-player-setting'>
                <Col span={12}>
                    <Text>{t('text-settings-text-position')}</Text>
                </Col>
                <Col span={12}>
                    <Text>{t('text-settings-font-size')}</Text>
                </Col>
                <Col span={12}>
                    <Select
                        className='cvat-workspace-settings-text-position'
                        value={textPosition}
                        onChange={onChangeTextPosition}
                    >
                        <Select.Option value='auto'>{t('text-settings-text-positions.Auto')}</Select.Option>
                        <Select.Option value='center'>{t('text-settings-text-positions.Center')}</Select.Option>
                    </Select>
                </Col>
                <Col span={12}>
                    <InputNumber
                        className='cvat-workspace-settings-text-size'
                        onChange={onChangeTextFontSize}
                        min={8}
                        max={20}
                        value={textFontSize}
                    />
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-adaptive-zoom cvat-player-setting'>
                <Col span={24}>
                    <Checkbox
                        className='cvat-text-color'
                        checked={adaptiveZoom}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchAdaptiveZoom(event.target.checked);
                        }}
                    >
                        {t('adaptive-zoom')}
                    </Checkbox>
                </Col>
                <Col span={24}>
                    <Text type='secondary'>
                        {t('adaptive-zoom-tips')}
                    </Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-intelligent-polygon-cropping cvat-player-setting'>
                <Col span={24}>
                    <Checkbox
                        className='cvat-text-color'
                        checked={intelligentPolygonCrop}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchIntelligentPolygonCrop(event.target.checked);
                        }}
                    >
                        {t('intelligent-polygon-cropping')}
                    </Checkbox>
                </Col>
                <Col span={24}>
                    <Text type='secondary'>{t('intelligent-polygon-cropping-tips')}</Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-show-frame-tags cvat-player-setting'>
                <Col span={24}>
                    <Checkbox
                        className='cvat-text-color'
                        checked={showTagsOnFrame}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchShowingTagsOnFrame(event.target.checked);
                        }}
                    >
                        {t('Show tags on frame')}
                    </Checkbox>
                </Col>
                <Col span={24}>
                    <Text type='secondary'>{t('Show frame tags in the corner of the workspace')}</Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-focused-object-padding cvat-player-setting'>
                <Col>
                    <Text className='cvat-text-color'>{t('focused-object-padding')}</Text>
                    <InputNumber
                        min={minFocusedObjectPadding}
                        max={maxFocusedObjectPadding}
                        value={focusedObjectPadding}
                        onChange={(value: number | null): void => {
                            if (typeof value === 'number') {
                                onChangeFocusedObjectPadding(
                                    Math.floor(clamp(+value, minFocusedObjectPadding, maxFocusedObjectPadding)),
                                );
                            }
                        }}
                    />
                </Col>
                <Col span={24}>
                    <Text type='secondary'>{t('focused-object-padding-tips')}</Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-control-points-size cvat-player-setting'>
                <Col>
                    <Text className='cvat-text-color'>{t('control-points-size')}</Text>
                    <InputNumber
                        min={minControlPointsSize}
                        max={maxControlPointsSize}
                        value={controlPointsSize}
                        onChange={(value: number | undefined | string): void => {
                            if (typeof value !== 'undefined') {
                                onChangeControlPointsSize(
                                    Math.floor(clamp(+value, minControlPointsSize, maxControlPointsSize)),
                                );
                            }
                        }}
                    />
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-approx-poly-threshold cvat-player-setting'>
                <Col>
                    <Text className='cvat-text-color'>{t('approx-poly-threshold')}</Text>
                </Col>
                <Col span={7} offset={1}>
                    <Slider
                        min={0}
                        max={MAX_ACCURACY}
                        step={1}
                        value={defaultApproxPolyAccuracy}
                        dots
                        onChange={onChangeDefaultApproxPolyAccuracy}
                    />
                </Col>
                <Col>
                    <Text type='secondary'>
                        {t('approx-poly-threshold-tips')}
                    </Text>
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(WorkspaceSettingsComponent);
