// MetaMask passes accounts automatically
export const handleAccountChange = (accounts, setWeb3State) => {
    const selectedAccount = accounts?.[0] || null;

    setWeb3State((prevState) => ({
        ...prevState,
        selectedAccount,
        signer: null,
        provider: null,
        smartAccount: null,
        smartAccountAddress: null,
    }));
};
