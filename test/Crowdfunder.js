const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");


describe("Crowdfunder", function () {

    async function deploy() {
        const [owner, otherAccount] = await ethers.getSigners();
        const maxAmountToRaise = 100;

        const Crowdfunder = await ethers.getContractFactory("Crowdfunder");
        const crowdfunder = await Crowdfunder.deploy(maxAmountToRaise);
        
        return { crowdfunder, owner, otherAccount, maxAmountToRaise }; 
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { crowdfunder, owner } = await loadFixture(deploy);
        
            expect(await crowdfunder.owner()).to.equal(owner.address);
        });

        it("Should set the right maxAmountToRaise", async function () {
            const { crowdfunder, maxAmountToRaise } = await loadFixture(deploy);
        
            expect(await crowdfunder.maxAmountToRaise()).to.equal(maxAmountToRaise);
        });

        it("Should set the right amountRaised", async function () {
            const { crowdfunder } = await loadFixture(deploy);

            expect(await crowdfunder.amountRaised()).to.equal(0);
        });

        it("Should set the right totalNumberContributors", async function () {
            const { crowdfunder } = await loadFixture(deploy);

            expect(await crowdfunder.totalNumberContributors()).to.equal(0);
        });
    });

    describe("Contribution", function () {
       
        it("Should not allow a user to contribute 0", async function () {
            const { crowdfunder } = await loadFixture(deploy);

            await expect(crowdfunder.contribute({ value: 0 })).to.be.revertedWith("Contribution must be greater than 0");
        });

        it("Should not allow a user to contribute more than the maxAmountToRaise", async function () {
            const { crowdfunder } = await loadFixture(deploy);

            await crowdfunder.contribute({ value: 150 });
            await expect(crowdfunder.contribute({ value: 100 })).to.be.revertedWith("Campaign has reached its maximum amount to raise");
        });

        it("Should allow a user to contribute", async function () {
            const { crowdfunder, otherAccount } = await loadFixture(deploy);

            await crowdfunder.connect(otherAccount).contribute({ value: 50 });
            expect(await crowdfunder.getContribution(otherAccount)).to.be.equal(50);
            expect(await crowdfunder.amountRaised()).to.equal(50);
            expect(await crowdfunder.totalNumberContributors()).to.equal(1);
        });

        it("Should add the latest contribution to the totalNumberContributors", async function () {
            const { crowdfunder } = await loadFixture(deploy);

            await crowdfunder.contribute({ value: 50 });
            expect(await crowdfunder.totalNumberContributors()).to.equal(1);
        });

        it("Should be able to find contribution amount of a user in contributions mapping", async function () {
            const { crowdfunder, otherAccount } = await loadFixture(deploy);

            await crowdfunder.connect(otherAccount).contribute({ value: 20 });
            expect(await crowdfunder.getContribution(otherAccount.address)).to.equal(20);
        });

        it("Should add the latest contribution to the amountRaised", async function () {
            const { crowdfunder } = await loadFixture(deploy);

            await crowdfunder.contribute({ value: 50 });
            expect(await crowdfunder.amountRaised()).to.equal(50);
        });

        it("Should recognize when the same user donates multiple times and update contract balance appropriately", async function () {
            const { crowdfunder, otherAccount } = await loadFixture(deploy);

            await crowdfunder.connect(otherAccount).contribute({ value: 50 });
            await crowdfunder.connect(otherAccount).contribute({ value: 50 });
            expect(await crowdfunder.getContractBalance()).to.equal(100);
        });

        it("Should recognize when the same user donates multiple times and update number of contributors appropriately", async function () {
            const { crowdfunder, otherAccount } = await loadFixture(deploy);

            await crowdfunder.connect(otherAccount).contribute({ value: 50 });
            await crowdfunder.connect(otherAccount).contribute({ value: 50 });
            expect(await crowdfunder.totalNumberContributors()).to.equal(1);
        });

        it("Should emit a ContributionReceived event when a contribution is made", async function () {
            const { crowdfunder, owner } = await loadFixture(deploy);

            await expect(crowdfunder.contribute({ value: 50 })).to.emit(crowdfunder, "ContributionReceived").withArgs(owner, 50); 
        });

    });

    describe("Withdraw", function () {

        it("Should not allow the owner to withdraw the funds if no contributions are made", async function () {
            const { crowdfunder, owner } = await loadFixture(deploy);

            await expect(crowdfunder.withdraw()).to.be.revertedWith("No contributions yet!");
        });

        it("Should allow the owner to withdraw the funds", async function () {
            const { crowdfunder, owner, otherAccount } = await loadFixture(deploy);

            await crowdfunder.connect(otherAccount).contribute({ value: 50 });
            await crowdfunder.connect(owner).withdraw();
            expect(await crowdfunder.getContractBalance()).to.equal(0);
        });

        it("Should not allow any other user to withdraw the funds", async function () {
            const { crowdfunder, otherAccount } = await loadFixture(deploy);

            await crowdfunder.connect(otherAccount).contribute({ value: 50 });
            expect(await crowdfunder.withdraw()).to.be.revertedWith("Only the owner can call this function");
        });
    });

    describe("getContractBalance", function () {
        it("Should get the correct contract balance if no users have contributed", async function () {
            const { crowdfunder } = await loadFixture(deploy);

            expect(await crowdfunder.getContractBalance()).to.equal(0);
        });

        it("Should get the correct contract balance if some users have contributed", async function () {
            const { crowdfunder, otherAccount } = await loadFixture(deploy);

            await crowdfunder.connect(otherAccount).contribute({ value: 50 });
            expect(await crowdfunder.getContractBalance()).to.equal(50);
        });
    });

    describe("getContribution", function () {
        it("Should get the correct contribution amount for the user", async function () {
            const { crowdfunder, otherAccount } = await loadFixture(deploy);

            await crowdfunder.connect(otherAccount).contribute({ value: 30 });
            expect(await crowdfunder.getContribution(otherAccount)).to.equal(30);
        })
    })

    describe("getContributor", function () {
        it("Should get the correct information for the user that contributed", async function () {
            const { crowdfunder, otherAccount } = await loadFixture(deploy);

            await crowdfunder.connect(otherAccount).contribute({ value: 30 });

            const result = await crowdfunder.getContributor(0);

            expect(result[0]).to.equal(otherAccount);
            expect(result[1]).to.equal(30);
        })
    })

});