import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'antd/lib/select';
import { handleDropdownKeyDown } from 'utils/dropdown-utils';

export interface MemberRoleSelectorProps {
    value: string | null;
    onChange: (role: string) => void;
    disabled?: boolean;
}

export default function MemberRoleSelector(props: Readonly<MemberRoleSelectorProps>): JSX.Element {
    const { t } = useTranslation('business');
    const { value, onChange, disabled } = props;
    const roleOptions = ['worker', 'supervisor', 'maintainer', 'owner'].map((role) => ({
        value: role,
        label: t(role[0].toUpperCase() + role.slice(1)),
    }));

    return (
        <Select
            value={value}
            onChange={onChange}
            disabled={disabled || value === 'owner'}
            onKeyDown={handleDropdownKeyDown}
            className='cvat-organization-member-role-selector'
            placeholder={t('Select role')}
        >
            {value === 'owner' ? (
                <Select.Option value='owner'>{t('Owner')}</Select.Option>
            ) : (
                roleOptions.filter((option) => option.value !== 'owner').map((option) => (
                    <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                ))
            )}
        </Select>
    );
}
