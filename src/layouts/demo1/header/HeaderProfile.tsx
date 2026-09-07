import { useAuthContext } from '@/auth';
import { toAbsoluteUrl } from '@/utils';

const FALLBACK_AVATAR = '/media/avatars/300-2.png';

const HeaderProfile = () => {
  const { currentUser } = useAuthContext();

  // currentUser is populated by verify() after auth resolves, so it can be
  // briefly undefined even behind RequireAuth — fall back down the chain
  // rather than rendering an empty banner.
  const name =
    currentUser?.fullname?.trim() ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ').trim() ||
    currentUser?.username ||
    currentUser?.email?.split('@')[0] ||
    '';

  const subtitle = currentUser?.occupation?.trim() || currentUser?.email || '';

  return (
    <div className="flex items-center ms-auto">
      <div className="flex items-center gap-2.5 rounded-full border border-gray-200 py-1 ps-1 pe-1 sm:pe-4">
        <img
          src={toAbsoluteUrl(currentUser?.pic || FALLBACK_AVATAR)}
          className="size-8 shrink-0 rounded-full border-2 border-success object-cover"
          alt={name || 'Profile'}
        />

        {name && (
          <div className="hidden sm:flex flex-col gap-1">
            <span className="text-2sm font-semibold leading-none text-gray-900">{name}</span>
            {subtitle && <span className="text-2xs leading-none text-gray-600">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export { HeaderProfile };
