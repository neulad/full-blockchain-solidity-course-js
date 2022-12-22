import { ConnectButton } from '@web3uikit/web3';

const Header = () => {
  return (
    <div className="border-b-2 flex justify-between items-center">
      <h1 className="py-4 px-4 font-blog text-3xl">Decentralised lottery</h1>
      <ConnectButton moralisAuth={false} />
    </div>
  );
};

export default Header;
