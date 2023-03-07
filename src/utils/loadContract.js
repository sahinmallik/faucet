const contract = require("@truffle/contract");

export const loadContract = async (name, provider) => {
  const res = await fetch(`/contracts/${name}.json`);
  const Artifacts = await res.json();
  const _contract = contract(Artifacts);
  _contract.setProvider(provider);
  const deployedContract = await _contract.deployed();
  return deployedContract;
};
