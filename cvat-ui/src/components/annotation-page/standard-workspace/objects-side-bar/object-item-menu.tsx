// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import i18n from 'i18n';
import Button from 'antd/lib/button';
import { MenuProps } from 'antd/lib/menu';
import Icon, {
    LinkOutlined, CopyOutlined, BlockOutlined, RetweetOutlined, DeleteOutlined, EditOutlined,
    FunctionOutlined, VerticalAlignBottomOutlined,
} from '@ant-design/icons';

import {
    BackgroundIcon, ForegroundIcon, ResetPerspectiveIcon, ColorizeIcon, SliceIcon,
    OneLayerBackwardIcon, OneLayerForwardIcon, SimplifyIcon,
} from 'icons';
import CVATTooltip from 'components/common/cvat-tooltip';
import { ColorBy } from 'reducers';
import {
    DimensionType, Job, ObjectType, ShapeType,
} from 'cvat-core-wrapper';

interface Props {
    locked: boolean;
    serverID: number | null;
    shapeType: ShapeType;
    objectType: ObjectType;
    color: string;
    colorBy: ColorBy;
    colorPickerVisible: boolean;
    changeColorShortcut: string;
    copyShortcut: string;
    pasteShortcut: string;
    sliceShortcut: string;
    propagateShortcut: string;
    toBackgroundShortcut: string;
    toForegroundShortcut: string;
    toOneLayerBackwardShortcut: string;
    toOneLayerForwardShortcut: string;
    removeShortcut: string;
    runAnnotationsActionShortcut: string;
    closeMenu(): void;
    changeColor(value: string): void;
    copy(): void;
    remove(): void;
    propagate(): void;
    createURL(): void;
    switchOrientation(): void;
    toBackground(): void;
    toForeground(): void;
    toOneLayerBackward(): void;
    toOneLayerForward(): void;
    resetCuboidPerspective(): void;
    setLayerPopoverVisible(visible: boolean): void;
    setColorPickerVisible(visible: boolean): void;
    edit(): void;
    slice(): void;
    simplify(): void;
    runAnnotationAction(): void;
    jobInstance: Job;
}

interface ItemProps {
    toolProps: Props;
}

function CreateURLItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { serverID, createURL } = toolProps;
    return (
        <Button
            className='cvat-object-item-menu-create-url'
            disabled={!Number.isInteger(serverID)}
            type='link'
            icon={<LinkOutlined />}
            onClick={createURL}
        >
            {i18n.t('Create object URL', { ns: 'business' })}
        </Button>
    );
}

function MakeCopyItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { copyShortcut, pasteShortcut, copy } = toolProps;
    return (
        <CVATTooltip title={`${copyShortcut} and ${pasteShortcut}`}>
            <Button
                className='cvat-object-item-menu-make-copy'
                type='link'
                icon={<CopyOutlined />}
                onClick={copy}
            >
                {i18n.t('Make a copy', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function EditMaskItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { edit } = toolProps;
    return (
        <CVATTooltip title={i18n.t('Shift + Double click', { ns: 'business' })}>
            <Button
                type='link'
                icon={<EditOutlined />}
                onClick={edit}
                className='cvat-object-item-menu-edit-object'
            >
                {i18n.t('Edit', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function SliceItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { slice, sliceShortcut } = toolProps;
    return (
        <CVATTooltip title={i18n.t('Cut the shape into two parts {{shortcut}}', { ns: 'business', shortcut: sliceShortcut })}>
            <Button
                type='link'
                icon={<Icon component={SliceIcon} />}
                onClick={slice}
                className='cvat-object-item-menu-slice-object'
            >
                {i18n.t('Slice', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function SimplifyItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { simplify } = toolProps;
    return (
        <CVATTooltip title={i18n.t('Reduce the number of polygon points', { ns: 'business' })}>
            <Button
                type='link'
                icon={<Icon component={SimplifyIcon} />}
                onClick={simplify}
                className='cvat-object-item-menu-simplify-object'
            >
                {i18n.t('Simplify', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function PropagateItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { propagateShortcut, propagate } = toolProps;
    return (
        <CVATTooltip title={`${propagateShortcut}`}>
            <Button
                type='link'
                icon={<BlockOutlined />}
                onClick={propagate}
                className='cvat-object-item-menu-propagate-item'
            >
                {i18n.t('Propagate', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function SwitchOrientationItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { switchOrientation } = toolProps;
    return (
        <Button
            type='link'
            icon={<RetweetOutlined />}
            onClick={switchOrientation}
            className='cvat-object-item-menu-switch-orientation'
        >
            {i18n.t('Switch orientation', { ns: 'business' })}
        </Button>
    );
}

function ResetPerspectiveItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { resetCuboidPerspective } = toolProps;
    return (
        <Button
            type='link'
            onClick={resetCuboidPerspective}
            className='cvat-object-item-menu-reset-perspective'
        >
            <Icon component={ResetPerspectiveIcon} />
            {i18n.t('Reset perspective', { ns: 'business' })}
        </Button>
    );
}

function ToBackgroundItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { toBackgroundShortcut, toBackground } = toolProps;
    return (
        <CVATTooltip title={`${toBackgroundShortcut}`}>
            <Button
                type='link'
                onClick={toBackground}
                className='cvat-object-item-menu-to-layer-background'
            >
                <Icon component={BackgroundIcon} />
                {i18n.t('To background', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function ToForegroundItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { toForegroundShortcut, toForeground } = toolProps;
    return (
        <CVATTooltip title={`${toForegroundShortcut}`}>
            <Button
                type='link'
                onClick={toForeground}
                className='cvat-object-item-menu-to-layer-foreground'
            >
                <Icon component={ForegroundIcon} />
                {i18n.t('To foreground', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function ToOneLayerBackwardItem(props: Readonly<ItemProps>): JSX.Element {
    const { toolProps } = props;
    const { toOneLayerBackwardShortcut, toOneLayerBackward } = toolProps;
    return (
        <CVATTooltip title={`${toOneLayerBackwardShortcut}`}>
            <Button
                type='link'
                onClick={toOneLayerBackward}
                className='cvat-object-item-menu-to-one-layer-backward'
            >
                <Icon component={OneLayerBackwardIcon} />
                {i18n.t('To one layer backward', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function ToOneLayerForwardItem(props: Readonly<ItemProps>): JSX.Element {
    const { toolProps } = props;
    const { toOneLayerForwardShortcut, toOneLayerForward } = toolProps;
    return (
        <CVATTooltip title={`${toOneLayerForwardShortcut}`}>
            <Button
                type='link'
                onClick={toOneLayerForward}
                className='cvat-object-item-menu-to-one-layer-forward'
            >
                <Icon component={OneLayerForwardIcon} />
                {i18n.t('To one layer forward', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function ToLayerItem(props: Readonly<ItemProps>): JSX.Element {
    const { toolProps } = props;
    const { closeMenu, setLayerPopoverVisible } = toolProps;

    return (
        <Button
            type='link'
            icon={<VerticalAlignBottomOutlined />}
            onClick={(): void => {
                setLayerPopoverVisible(true);
                closeMenu();
            }}
            className='cvat-object-item-menu-move-to-layer'
        >
            {i18n.t('Move to layer ...', { ns: 'business' })}
        </Button>
    );
}

function SwitchColorItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { changeColorShortcut, colorBy, setColorPickerVisible } = toolProps;

    return (
        <CVATTooltip title={`${changeColorShortcut}`}>
            <Button onClick={() => setColorPickerVisible(true)} type='link' className='cvat-object-item-menu-change-color'>
                <Icon component={ColorizeIcon} />
                {i18n.t('Change {{type}} color', { ns: 'business', type: i18n.t(colorBy.toLowerCase(), { ns: 'business' }) })}
            </Button>
        </CVATTooltip>
    );
}

function RemoveItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { removeShortcut, remove } = toolProps;
    return (
        <CVATTooltip title={`${removeShortcut}`}>
            <Button
                type='link'
                icon={<DeleteOutlined />}
                onClick={remove}
                className='cvat-object-item-menu-remove-object'
            >
                {i18n.t('Remove', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

function RunAnnotationActionItem(props: ItemProps): JSX.Element {
    const { toolProps } = props;
    const { runAnnotationsActionShortcut, runAnnotationAction } = toolProps;
    return (
        <CVATTooltip title={`${runAnnotationsActionShortcut}`}>
            <Button
                type='link'
                icon={<FunctionOutlined />}
                onClick={runAnnotationAction}
                className='cvat-object-item-menu-remove-object'
            >
                {i18n.t('Run annotation action', { ns: 'business' })}
            </Button>
        </CVATTooltip>
    );
}

export default function ItemMenu(props: Props): MenuProps {
    const {
        locked, shapeType, objectType, colorBy, jobInstance,
    } = props;

    enum MenuKeys {
        CREATE_URL = 'create_url',
        COPY = 'copy',
        PROPAGATE = 'propagate',
        SWITCH_ORIENTATION = 'switch_orientation',
        RESET_PERSPECTIVE = 'reset_perspective',
        TO_BACKGROUND = 'to_background',
        TO_FOREGROUND = 'to_foreground',
        TO_ONE_LAYER_BACKWARD = 'to_one_layer_backward',
        TO_ONE_LAYER_FORWARD = 'to_one_layer_forward',
        MOVE_TO_LAYER = 'move_to_layer',
        SWITCH_COLOR = 'switch_color',
        REMOVE_ITEM = 'remove_item',
        EDIT_MASK = 'edit_mask',
        SLICE_ITEM = 'slice_item',
        SIMPLIFY_ITEM = 'simplify_item',
        RUN_ANNOTATION_ACTION = 'run_annotation_action',
    }

    const is2D = jobInstance.dimension === DimensionType.DIMENSION_2D;

    const items: MenuProps['items'] = [{
        key: MenuKeys.CREATE_URL,
        label: <CreateURLItem toolProps={props} />,
    }];

    if (objectType !== ObjectType.TAG) {
        items.push({
            key: MenuKeys.COPY,
            label: <MakeCopyItem toolProps={props} />,
        });
    }

    if (!locked && shapeType === ShapeType.MASK) {
        items.push({
            key: MenuKeys.EDIT_MASK,
            label: <EditMaskItem toolProps={props} />,
        });
    }

    if (
        !locked && objectType === ObjectType.SHAPE &&
        [ShapeType.MASK, ShapeType.POLYGON].includes(shapeType)
    ) {
        items.push({
            key: MenuKeys.SLICE_ITEM,
            label: <SliceItem key={MenuKeys.SLICE_ITEM} toolProps={props} />,
        });
    }

    if (
        !locked && objectType === ObjectType.SHAPE &&
        [ShapeType.POLYGON, ShapeType.POLYLINE].includes(shapeType)
    ) {
        items.push({
            key: MenuKeys.SIMPLIFY_ITEM,
            label: <SimplifyItem key={MenuKeys.SIMPLIFY_ITEM} toolProps={props} />,
        });
    }

    items.push({
        key: MenuKeys.PROPAGATE,
        label: <PropagateItem toolProps={props} />,
    });

    if (is2D && !locked && [ShapeType.POLYGON, ShapeType.POLYLINE, ShapeType.CUBOID].includes(shapeType)) {
        items.push({
            key: MenuKeys.SWITCH_ORIENTATION,
            label: <SwitchOrientationItem toolProps={props} />,
        });
    }

    if (is2D && !locked && shapeType === ShapeType.CUBOID) {
        items.push({
            key: MenuKeys.RESET_PERSPECTIVE,
            label: <ResetPerspectiveItem toolProps={props} />,
        });
    }

    if (is2D && !locked && objectType !== ObjectType.TAG) {
        items.push({
            key: MenuKeys.TO_BACKGROUND,
            label: <ToBackgroundItem toolProps={props} />,
        });

        items.push({
            key: MenuKeys.TO_FOREGROUND,
            label: <ToForegroundItem toolProps={props} />,
        });

        items.push({
            key: MenuKeys.TO_ONE_LAYER_BACKWARD,
            label: <ToOneLayerBackwardItem toolProps={props} />,
        });

        items.push({
            key: MenuKeys.TO_ONE_LAYER_FORWARD,
            label: <ToOneLayerForwardItem toolProps={props} />,
        });

        items.push({
            key: MenuKeys.MOVE_TO_LAYER,
            label: <ToLayerItem toolProps={props} />,
        });
    }

    if (!locked && [ColorBy.INSTANCE, ColorBy.GROUP].includes(colorBy)) {
        items.push({
            key: MenuKeys.SWITCH_COLOR,
            label: <SwitchColorItem toolProps={props} />,
        });
    }

    items.push({
        key: MenuKeys.REMOVE_ITEM,
        label: <RemoveItem toolProps={props} />,
    });

    items.push({
        key: MenuKeys.RUN_ANNOTATION_ACTION,
        label: <RunAnnotationActionItem toolProps={props} />,
    });

    return {
        items,
        onClick: (event): void => {
            event.domEvent.stopPropagation();
        },
        selectable: false,
        className: 'cvat-object-item-menu',
    };
}
