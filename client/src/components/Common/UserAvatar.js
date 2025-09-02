import React from 'react';
import { UserIcon } from '@heroicons/react/24/solid';

const UserAvatar = ({ user, size = 'md', showStatus = false, online = false }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6 text-xs';
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'md':
        return 'w-10 h-10 text-base';
      case 'lg':
        return 'w-12 h-12 text-lg';
      case 'xl':
        return 'w-16 h-16 text-xl';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = () => {
    if (!showStatus) return '';
    return online ? 'bg-green-400' : 'bg-gray-400';
  };

  if (!user) {
    return (
      <div className={`relative inline-flex items-center justify-center rounded-full bg-gray-200 ${getSizeClasses()}`}>
        <UserIcon className="h-1/2 w-1/2 text-gray-400" />
        {showStatus && (
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor()}`} />
        )}
      </div>
    );
  }

  if (user.avatar) {
    return (
      <div className="relative inline-block">
        <img
          src={user.avatar}
          alt={`${user.firstName} ${user.lastName}`}
          className={`inline-block rounded-full object-cover ${getSizeClasses()}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className={`hidden items-center justify-center rounded-full bg-primary-100 text-primary-600 ${getSizeClasses()}`}>
          {getInitials()}
        </div>
        {showStatus && (
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor()}`} />
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-600 ${getSizeClasses()}`}>
      {getInitials()}
      {showStatus && (
        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor()}`} />
      )}
    </div>
  );
};

export default UserAvatar;
