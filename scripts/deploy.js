const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const Crowdfunder = await hre.ethers.getContractFactory("Crowdfunder");
  const crowdfunder = await Crowdfunder.deploy(1000000000000000);
  await crowdfunder.waitForDeployment()

  console.log("Crowdfunder deployed to:",await crowdfunder.getAddress());
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

