const { ethers } = require("hardhat");

async function main() {
  const TweetContract = await ethers.getContractFactory("TweetContract");
  console.log("Deploying TweetContract...");

  const tweet = await TweetContract.deploy();
  await tweet.waitForDeployment();

  const address = await tweet.getAddress();
  console.log("TweetContract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
