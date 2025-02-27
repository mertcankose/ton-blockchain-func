# TON Vesting Frontend

A frontend application for interacting with TON blockchain vesting contracts.

## Features

- Connect to TON wallets using TON Connect
- View vesting contract information
- Claim unlocked tokens
- Send jettons to other addresses
- Add addresses to the whitelist

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/ton-vesting-frontend.git
cd ton-vesting-frontend
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Deployment

To build the application for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Configuration

To use your own vesting contract, update the `VESTING_CONTRACT_ADDRESS` in `src/hooks/useVestingContract.ts`.

## Built With

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TON Connect](https://github.com/ton-connect/sdk) - Wallet connection
- [TON Core](https://github.com/ton-core/ton-core) - TON blockchain interaction
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.
