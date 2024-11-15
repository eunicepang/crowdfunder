import { Box, Button, Flex, Input, Table, Thead, Tbody, Tr, Th, Td, ChakraProvider, Heading } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Utils } from 'alchemy-sdk';
import Crowdfunder from './abis/Crowdfunder.json';

const { ethers } = require("ethers");


function App() {
  const [owner, setOwner] = useState('');
  const [amountRaised, setAmountRaised] = useState(0);
  const [maxAmountToRaise, setMaxAmountToRaise] = useState(0);
  const [totalNumberContributors, setTotalNumberContributors] = useState(0);
  const [contributorsList, setContributorsList] = useState([]);
  const [contract, setContract] = useState(null);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [account, setAccount] = useState('');
  const [signer, setSigner] = useState(null);

  let contractAddress = "0xC4262313D5E5A38925e98018B9A7e420c2188a10";

  const web3Handler = async () => {

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setSigner(signer);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0])
    }
    catch (error) {
      if (error.code === -32002) {
        console.error("A connection request is already pending. Please wait.");
      } else {
        console.error(error);
      }
    }

    const contractInstance = new ethers.Contract(contractAddress, Crowdfunder.abi, signer)
    setContract(contractInstance);
    console.log("Contract:" + contractInstance);

    const amountRaised = await contractInstance.amountRaised();
    setAmountRaised(amountRaised);
    console.log("Amount raised: ", amountRaised.toString());

    const maxAmountToRaise = await contractInstance.maxAmountToRaise();
    setMaxAmountToRaise(maxAmountToRaise);
    console.log("Max amount to raise: ", maxAmountToRaise.toString());

    const totalNumberContributors = await contractInstance.totalNumberContributors();
    setTotalNumberContributors(totalNumberContributors);
    console.log("Total number of contributors: ", totalNumberContributors.toString());
    
    const owner = await contractInstance.owner();
    setOwner(owner);
    console.log("Owner: ", owner);

    const fetchedDonors = [];
      for (let i = 0; i < totalNumberContributors; i++) {
        const [contributorAddress, amount] = await contractInstance.getContributor(i);
        fetchedDonors.push({ contributorAddress, amount });
      }
      setContributorsList(fetchedDonors);
  }


  useEffect(() => {

    web3Handler();

    window.ethereum.on('accountsChanged', (accounts) => {
      setAccount(accounts[0]);
    });
  }, []);


    const contribute = async () => {
      if(contributionAmount === "") {
        return alert("Please enter an amount to contribute");
      } else {
        let valueInWei = ethers.parseEther(contributionAmount);
         
        try{
          const tx = await contract.contribute({value: valueInWei});
          await tx.wait();
          setContributionAmount("");
        } catch(error) {
          console.log(error);
        }
      }
    };

    const withdraw = async () => {
      try{
        const tx = await contract.withdraw();
        await tx.wait();
      } catch(error) {
        console.log(error);
      }
    };
  
  return (
    <Box >
      <ChakraProvider>
        <Box 
          p={8} 
          bg="blue.200" 
          color="black" 
          textAlign="center" 
          borderRadius="md" 
          maxW="100%" 
          mx="auto" 
          boxShadow="lg"
        >
          <Heading as="h1" size="2xl" fontWeight="bold" mb={4}>
            Crowdfunder
          </Heading>
          <Heading as="h2" size="lg" fontWeight="bold">
          Contribute to causes that matter to you!
          </Heading>
          </Box>
        </ChakraProvider>

        <ChakraProvider>
      <Flex justifyContent="center" m={10}>
        <Input
          m={10}
          w="600px"
          border="2px solid" 
          borderColor="gray.300"
          placeholder="Enter amount to contribute"
          value={contributionAmount}
          onChange={(e) => setContributionAmount(e.target.value)}
        />
        <Button 
          m={10}
          fontSize={20} 
          onClick={contribute} 
          bgColor="teal.200"
          w="600px"
        >Contribute</Button>

      <Button 
          m={10}
          fontSize={20} 
          onClick={withdraw} 
          bgColor="teal.200"
          w="600px"
        >Withdraw</Button>
      </Flex>

      <Box 
        textAlign="center"
        fontSize="xl"
      >
          Total number of donors: {totalNumberContributors.toString()}
      </Box>
      <Box 
        textAlign="center"
        fontSize="xl"
      >
        Total amount raised: {Utils.formatEther(amountRaised).toString()} ETH
      </Box>
      <Box 
        textAlign="center"
        fontSize="xl"
      >
        Max amount to raise: {Utils.formatEther(maxAmountToRaise).toString()} ETH
      </Box>

      </ChakraProvider>
    

      <ChakraProvider>
      <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Donor Address</Th>
              <Th>Donation Amount in ETH</Th>
            </Tr>
          </Thead>
          <Tbody>
            {contributorsList.map(item => (
              <Tr key={item.id}>
                <Td>{item.contributorAddress}</Td>
                <Td>{Utils.formatEther(item.amount).toString()}</Td>
              </Tr>
            ))}
          </Tbody>
      </Table>
      </ChakraProvider>

    </Box>
  );
}

export default App;
