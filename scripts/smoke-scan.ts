import { scanSolidityCode } from "../lib/analyzer";

const code = `
pragma solidity ^0.8.20;
contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;
    constructor(address _owner) { owner = _owner; }
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        (bool ok, ) = msg.sender.call{value: amount}("");
        balances[msg.sender] = 0;
    }
    function setOwner(address newOwner) public { owner = newOwner; }
}
`;

const r = scanSolidityCode(code);
console.log(
  JSON.stringify(
    r.findings.map((f) => ({ kind: f.kind, fn: f.functionName, line: f.line, sev: f.severity })),
    null,
    2,
  ),
);
