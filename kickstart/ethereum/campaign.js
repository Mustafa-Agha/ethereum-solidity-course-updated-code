import web3 from "./we3";
import { abi } from "./build/Campaign.json";

const campaignContract = (address) => {
    return new web3.eth.Contract(abi, address);
};

export default campaignContract;