import React, { useEffect, useState } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import "./App.css";
import { loadContract } from "./utils/loadContract";

export default function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  });

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [shouldReload, reload] = useState(false);

  const reloadEffect = () => reload(!shouldReload);
  const { provider, web3 } = web3Api;

  const setAccountListener = (provider) => {
    provider.on("accountsChanged", (accounts) => {
      setAccount(accounts[0]);
    });
  };

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();

      const contract = await loadContract("Faucet", provider);

      if (provider) {
        setAccountListener(provider);
        setWeb3Api({
          provider,
          web3: new Web3(provider),
          contract: contract,
        });
      } else {
        console.error("Please install MetaMask!");
      }
      // if (window.ethereum) {
      //   provider = window.ethereum;
      //   try {
      //     await provider.request({ method: "eth_requestAccounts" });
      //   } catch (error) {
      //     console.error(error);
      //   }
      // } else if (window.web3) {
      //   provider = window.web3.currentProvider;
      // } else if (!process.env.production) {
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545");
      // }
    };
    loadProvider();
  }, []);

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    };
    web3 && getAccount();
  }, [web3]);

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(web3.utils.fromWei(balance, "ether"));
    };

    web3Api.contract && loadBalance();
  }, [web3Api, shouldReload]);

  const addFunds = async () => {
    const { contract, web3 } = web3Api;
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether"),
    });
    // window.location.reload()
    reloadEffect();
  };

  const withdraw = async () => {
    const { contract, web3 } = web3Api;
    const withdrawAmount = web3.utils.toWei("0.1", "ether");
    await contract.withdraw(withdrawAmount, {
      from: account,
    });
    reloadEffect();
  };

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet">
          <div className="is-flex is-align-items-center">
            <div className="mr-2">
              <strong>Account: </strong>
            </div>
            <h1>
              {account ? (
                account
              ) : (
                <button
                  className="button is-link is-light is-small"
                  onClick={() => {
                    provider.request({ method: "eth_requestAccounts" });
                  }}
                >
                  Connect Wallet
                </button>
              )}
            </h1>
          </div>
          <div className="balance-view is-size-2 my-4">
            Current Balance: <strong>{balance}</strong> ETH
          </div>
          <button
            onClick={addFunds}
            className="button is-primary is-light mr-2"
          >
            Donate 1eth
          </button>
          <button onClick={withdraw} className="button is-link is-light">
            Withdraw 0.1 eth
          </button>
        </div>
      </div>
    </>
  );
}
