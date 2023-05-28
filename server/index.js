const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const {keccak256} = require("ethereum-cryptography/keccak");
const { utf8ToBytes, hexToBytes, bytesToHex } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

const balances = {
  "044232d478bc059fbc5021470fb56037fc166fd0a284dab421079c49c9e836ea962379e8c2bf3dd73fa0f1040dbeb8cedd195eeaffa8cba324da9b6b7cef3f18d5": 100,
  "04dbc42821687fe3ed9135219a57464e1c2c9c680f61ba2968f303a5a092a79413afd61b9773342c559d4e6242f1b3ddf17b13bd64f06f2b04a287c2c8a9fee430": 50,
  "04dd81b0e22adc79f74ded5723f650b97c5bec3fb32611247bfade1c685a5c69092286f334506ff0bcb78f892c3bf8373d3e047bbcdb801f5d3dee3c3c9a5ed3ce": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;

  res.send({ balance });
});

app.post("/send", (req, res) => {
  //recover the public address from the signature 
  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  const message = keccak256(utf8ToBytes("sendmoney"));
  const shashed = hexToBytes(signature);
  console.log(shashed);
  const senderPublicKey = bytesToHex(secp.recoverPublicKey(message, shashed ,recoveryBit));



  if (senderPublicKey != sender) {
    res.status(400).send({ message: "Invalid Signature or Invalid Transaction Type" });
  }
  else{
    console.log(senderPublicKey);
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
    
  }
}
