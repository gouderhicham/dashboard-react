import { FormattedMessage } from 'react-intl';
import { Check, Globe } from 'lucide-react';
import { MenuItem, MenuLink, MenuTitle, MenuIcon, MenuBadge, MenuHeading } from '@/components/menu';
import clsx from 'clsx';
import { I18N_LANGUAGES, TLanguage, useLanguage } from '@/i18n';

interface IDropdownUserLanguagesProps {
  menuItemRef: any;
}

const DropdownUserLanguages = ({ menuItemRef }: IDropdownUserLanguagesProps) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguage = (lang: TLanguage) => {
    changeLanguage(lang);

    if (menuItemRef?.current) {
      menuItemRef.current.hide(); // Close the user dropdown after switching
    }
  };

  return (
    <div className="flex flex-col">
      <MenuItem className="pointer-events-none">
        <MenuLink className="h-9">
          <MenuIcon>
            <Globe className="size-4!" />
          </MenuIcon>
          <MenuHeading className="text-2sm font-medium text-gray-600">
            <FormattedMessage id="USER.MENU.LANGUAGE" />
          </MenuHeading>
        </MenuLink>
      </MenuItem>

      {I18N_LANGUAGES.map((item, index) => (
        <MenuItem
          key={index}
          className={clsx('cursor-pointer', item.code === currentLanguage.code && 'active')}
          onClick={() => handleLanguage(item)}
        >
          <MenuLink className="h-9 ps-9">
            <MenuIcon>
              <img src={item.flag} className="inline-block size-4 rounded-full" alt={item.label} />
            </MenuIcon>
            <MenuTitle>{item.label}</MenuTitle>
            {item.code === currentLanguage.code && (
              <MenuBadge>
                <Check className="text-success size-4" />
              </MenuBadge>
            )}
          </MenuLink>
        </MenuItem>
      ))}
    </div>
  );
};

export { DropdownUserLanguages };
