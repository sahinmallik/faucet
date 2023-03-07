const Faucet = artifacts.require("./Faucet.sol");
module.exports = async function (deployer) {
  await deployer.deploy(Faucet);
};
