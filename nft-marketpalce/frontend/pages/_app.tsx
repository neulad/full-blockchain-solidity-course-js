import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { MoralisProvider } from 'react-moralis';
import { NotificationProvider } from 'web3uikit';
import Header from '../components/Header';

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://api.studio.thegraph.com/query/36380/nft-marketplace/v0.0.3',
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <ApolloProvider client={apolloClient}>
        <NotificationProvider>
          <Header />
          <Component {...pageProps} />
        </NotificationProvider>
      </ApolloProvider>
    </MoralisProvider>
  );
}

export default MyApp;
