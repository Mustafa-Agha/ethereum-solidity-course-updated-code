import web3 from "./we3";
import { abi } from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(abi, '0x193767764b8A3e031E972c2bd8e651a113C5334C');

export default instance;