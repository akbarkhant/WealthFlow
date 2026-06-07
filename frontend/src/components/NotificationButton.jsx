import usePushNotification from '../hooks/usePushNotification';

const NotificationButton = () => {
  const { isSubscribed, isSupported, isLoading, error, toggle } = usePushNotification();

  // Browser doesn't support push
  if (!isSupported) {
    return (
      <p className="text-sm text-gray-400">
        Push notifications are not supported in this browser.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={toggle}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition
          ${isLoading   ? 'bg-gray-400 cursor-not-allowed'   :
            isSubscribed ? 'bg-red-500 hover:bg-red-600'      :
                           'bg-blue-500 hover:bg-blue-600'    }
        `}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span> Loading...
          </>
        ) : isSubscribed ? (
          <>🔕 Disable Notifications</>
        ) : (
          <>🔔 Enable Notifications</>
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Status badge */}
      <p className="text-xs text-gray-500">
        Status:{' '}
        <span className={isSubscribed ? 'text-green-500' : 'text-gray-400'}>
          {isSubscribed ? '● Subscribed' : '○ Not subscribed'}
        </span>
      </p>
    </div>
  );
};

export default NotificationButton;