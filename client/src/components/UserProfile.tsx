import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const UserProfile: React.FC = () => {
  const { user, logout, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-600"></div>
        <span className="text-sage-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full border-2 border-sage-200"
          />
        )}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-sage-900">
            {user.name || user.email}
          </p>
        </div>
      </div>
      <button
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        className="text-sm text-sage-600 hover:text-sage-800 transition-colors font-medium"
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserProfile;
