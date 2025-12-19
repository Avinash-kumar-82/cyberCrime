export const handleChainChange = (chainIdHex, setWeb3State) => {
    const chainId = parseInt(chainIdHex, 16);

    setWeb3State((prevState) => ({
        ...prevState,
        chainId,
        signer: null,
        provider: null,
        smartAccount: null,
        smartAccountAddress: null,
    }));
};
