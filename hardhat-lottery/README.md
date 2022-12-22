<!-- ABOUT THE PROJECT -->
## About The Project
*This project was created for fun for learning purposes, never use it on production, it's raw and not tested at all!*

This is a final project in studying hardhat basics. Despite being a pet-project, structure is quite good + test coverage is quite decent.

<!-- GETTING STARTED -->
## Getting Started

Just grab everything to the console, no environmental variables needed!

### Prerequisites

I hope you've installed node.js already)
* npm
  ```sh
  npm install npm@latest -g
  ```
* hardhat-shorthand
  ```sh
  npm i -g hardhat-shorthand
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://gitlab.com/web3118/hardhat-lottery.git
   ```
2. Install dependencies
   ```sh
   npm install
   ```
3. Add .env file with the following variables
   ```sh
    export GOERLI_RPC_URL=**your_goerli_rpc_url**
    export PRIVATE_KEY=**your_private_key**
   ```
4. Add environmental variables to the console
   ```sh
   . ./.env
   ```
5. Compile contracts
   ```sh
   hh compile
   ```
6. Deploy contracts
   ```sh
   hh deploy
   ```
7. Run tests
   ```sh
   hh test
   ```

<!-- USAGE EXAMPLES -->
## Usage
Congrats!!!!
See other commands you can run using `hh help` command!

