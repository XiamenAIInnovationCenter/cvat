import React from 'react';
import Select from 'antd/lib/select';
import Button from 'antd/lib/button';
import {
    TranslationOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import i18n from 'i18n';
import { localeOptions } from 'i18n/config';

import Modal from 'antd/lib/modal';

export default function SwitchLocaleWithToolTip(): JSX.Element {
    const { t } = useTranslation('base');
    const options = localeOptions.map(
        ({ name: label, code: value }) => ({ value, label }),
    );
    const [locale, setLocale] = React.useState<string>(i18n.language);
    const [show, setShow] = React.useState(false);

    return (
        <>
            <Button
                icon={<TranslationOutlined />}
                size='large'
                className='cvat-switch-i18n-locale-button cvat-header-button'
                type='text'
                title={t('Switch locale')}
                onClick={(): void => setShow(true)}
            />
            <Modal
                title={t('Switch locale')}
                mask
                open={show}
                onOk={() => {
                    if (locale !== i18n.language) {
                        i18n.changeLanguage(locale);
                    }
                    setShow(false);
                }}
                width={300}
                onCancel={() => setShow(false)}
                okText={t('OK')}
                cancelText={t('Cancel')}
            >
                <Select
                    value={locale}
                    options={options}
                    style={{ width: '100%' }}
                    onChange={(value) => {
                        setLocale(value);
                    }}
                />
            </Modal>
        </>
    );
}
