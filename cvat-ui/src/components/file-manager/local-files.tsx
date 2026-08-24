// Copyright (C) 2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';

import Text from 'antd/lib/typography/Text';
import Upload, { RcFile } from 'antd/lib/upload';
import { InboxOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface Props {
    files: File[];
    many: boolean;
    onUpload: (_: RcFile, uploadedFiles: RcFile[]) => boolean;
}

export default function LocalFiles(props: Props): JSX.Element {
    const { t } = useTranslation('business');
    const { files, onUpload, many } = props;
    const hintText = many ? t('You can upload one or more videos') :
        t('You can upload an archive with images, a video, or multiple images');

    return (
        <>
            <Upload.Dragger
                multiple
                listType='text'
                fileList={files as any[]}
                showUploadList={
                    files.length < 5 && {
                        showRemoveIcon: false,
                    }
                }
                beforeUpload={onUpload}
            >
                <p className='ant-upload-drag-icon'>
                    <InboxOutlined />
                </p>
                <p className='ant-upload-text'>{t('Click or drag files to this area')}</p>
                <p className='ant-upload-hint'>{ hintText }</p>
            </Upload.Dragger>
            {files.length >= 5 && (
                <>
                    <br />
                    <Text className='cvat-text-color'>{t('{{count}} files selected', { count: files.length })}</Text>
                </>
            )}
        </>
    );
}
