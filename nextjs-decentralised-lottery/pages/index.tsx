import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { MoralisProvider } from 'react-moralis';
// import HeaderManual from './components/HeaderManual';
import Header from './components/Header';
import LotteryEntrance from './components/LotteryEntrance';

const Home: NextPage = () => {
  return (
    <div>
      <Header />
      <LotteryEntrance />
    </div>
  );
};

export default Home;
