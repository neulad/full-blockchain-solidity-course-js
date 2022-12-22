import { useMoralis } from 'react-moralis';
import { useEffect } from 'react';

const HeaderManual = () => {
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (window.localStorage.getItem('connected')) enableWeb3();
  }, [enableWeb3, isWeb3Enabled]);

  Moralis.onAccountChanged(account => {
    if (account === null) {
      window.localStorage.removeItem('connected');
      deactivateWeb3();
    }
  });

  return (
    <div>
      {account ? (
        <div>Connected!</div>
      ) : (
        <button
          onClick={async () => {
            enableWeb3();
            window.localStorage.setItem('connected', 'injected');
          }}
          disabled={isWeb3EnableLoading}
        >
          Connect
        </button>
      )}
    </div>
  );
};

export default HeaderManual;
