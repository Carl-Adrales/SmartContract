// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Assessment {
    address payable public owner;
    mapping(address => uint256) public balances;

    event Deposit(address indexed depositor, uint256 amount);
    event Withdrawal(address indexed withdrawer, uint256 amount);
    event TransferToken(address indexed sender, address indexed recipient, uint256 amount);

    constructor() payable {
        owner = payable(msg.sender);
    }

    function getBalance(address _account) public view returns (uint256) {
        return balances[_account];
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");

        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit Withdrawal(msg.sender, _amount);
    }

    function transferToken(address payable _to, uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");

        balances[msg.sender] -= _amount;
        balances[_to] += _amount;

        emit TransferToken(msg.sender, _to, _amount);
    }
}
