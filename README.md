# ontology-tutorialtoken

<!-- TOC -->

- [ontology-tutorialtoken](#ontology-tutorialtoken)
    - [Introduction](#introduction)
    - [Setting up the development environment](#setting-up-the-development-environment)
    - [Getting started](#getting-started)
        - [Unboxing the DApp](#unboxing-the-dapp)
        - [Creating Smart Contract](#creating-smart-contract)
        - [Implement the Interface of OEP4 Contract](#implement-the-interface-of-oep4-contract)
            - [Get Parameters of the Token](#get-parameters-of-the-token)
                - [Get Token Name](#get-token-name)
                - [Get Token Symbol](#get-token-symbol)
                - [Get Token Decimal](#get-token-decimal)
                - [Get Token TotalSupply](#get-token-totalsupply)
            - [Initialize Token Parameter](#initialize-token-parameter)
        - [Check Balance](#check-balance)
        - [Support Transfer](#support-transfer)
            - [Transfer](#transfer)
            - [TransferMulti](#transfermulti)
            - [TransferFrom](#transferfrom)
        - [Run your DApp](#run-your-dapp)
        - [Use your DApp](#use-your-dapp)
            - [Information Query](#information-query)
            - [DApp Settings](#dapp-settings)

<!-- /TOC -->

## Introduction

The [OEP4 token standard](https://github.com/ontio/OEPs/blob/1d9234f2f09fbc0ef9bcf29b6cfca164ff356c52/OEP-4/OEP-Token-Standard.mediawiki) describes the functions and events that an Ontology token contract has to implement.

Specifically, In OEP4, we need to implement the following interface for our OEP4 Token.

|    | Interface          | Description                                                                                 |
|:--:|:-------------------|:--------------------------------------------------------------------------------------------|
| 1  | init()             | initialize smart contract parameter                                                         |
| 2  | get_name()         | return the name of an oep4 token                                                            |
| 3  | get_symbol()       | return the symbol of an oep4 token                                                          |
| 4  | get_decimal()      | return the number of decimals used by the oep4 token                                        |
| 5  | get_total_supply() | return the total supply of the oep4 token                                                   |
| 6  | approve()          | allows spender to withdraw a certain amount of oep4 token from owner account multiple times |
| 7  | allowance()        | query the amount of spender still allowed to withdraw from owner account                    |
| 8  | balance_of()       | query the ope4 token balance of the given base58 encode address                             |
| 9  | transfer()         | transfer an amount of tokens from one account to another account                            |
| 10 | transfer_multi()   | transfer amount of token from multiple from-account to multiple to-account multiple times   |
| 11 | transfer_from()    | allow spender to withdraw amount of oep4 token from from-account to to-account              |

Benefit from [Ontology Python Sdk](https://pypi.org/project/ontology-python-sdk/), we can easily calling OEP4 interface by Python. If you want to know more details, you can read our [Ontology Python SDK API Reference](https://apidoc.ont.io/pythonsdk/#oep4).

## Setting up the development environment

There are a few technical requirements before we start. Please install the following:

- [Python 3.7](https://www.python.org/downloads/release/python-370/)
- [Git](https://git-scm.com/)

## Getting started

### Unboxing the DApp

Install Ontology DApp Box.

```shell
pip install OBox
```

Download the DApp box.

```shell
OBox --install tutorialtoken
```

Create virtual environments(optional).

```shell
virtualenv --no-site-packages venv
```

Install the necessary dependencies.

```shell
pip install -r requirements.txt
```

### Creating Smart Contract

With our front-end taken care of, we can focus on the `oep4_token` contract.

In the `contracts/` directory of your `OBox`, create the file `oep4_token.py` and add the following contents:

```python
from boa.interop.System.Storage import GetContext, Get, Put, Delete
from boa.interop.System.Runtime import Notify, CheckWitness
from boa.builtins import concat, ToScriptHash

ctx = GetContext()
```

The interface `GetContext()` is used to get current storage context in smart contract.

**NOTE**: Storage is an important conception in Ontology Blockchain, which maintain a key-value storage context that used to save the global variable.

- We can use `Put()` interface to insert data into a persistent storage area in the from of key-value.
- We can use `Get()` interface to get value by key from a persistent storage area.

To set our own parameters for the token, we'll be declaring our own name, symbol, and other details. Add the following content block to the contract:

```python
NAME = 'DXToken'
SYMBOL = 'DX'
DECIMAL = 2
FACTOR = 100000000
OWNER = ToScriptHash("AUQ2cqRs2daQBqTFs6Zun8eYXRe4a9JZUC")
TOTAL_AMOUNT = 1000000000

SUPPLY_KEY = 'totoalSupply'

TRANSFER_PREFIX = bytearray(b'\x01')
APPROVE_PREFIX = bytearray(b'\x02 ')
```

Things to notice:

- The `NAME` and `SYMBOL` variables give our token a unique identity.
- The `DECIMAL` variable determines the degree to which this token can be subdivided. For our example we went with 2 decimal places, similar to dollars and cents.
- The `TOTAL_AMOUNT` variable determines the number of tokens created when this contract is deployed. In this case, the number is arbitrary.
- The `SUPPLY_KEY`, `TRANSFER_PREFIX` and `APPROVE_PREFIX` variable will be used in storage.

### Implement the Interface of OEP4 Contract

#### Get Parameters of the Token

Now, we want to get the parameters of the token, we can just return them.

##### Get Token Name

```python
def Name():
    return NAME
```

##### Get Token Symbol

```python
def Symbol():
    return SYMBOL
```

##### Get Token Decimal

```python
def Decimal():
    return DECIMAL
```

##### Get Token TotalSupply

The difference between the two following code is if you use `Get(ctx,SUPPLY_KEY)` to acquire the total supply of your OEP4 Token, you need to initialize the total supply by using `Put(ctx, SUPPLY_KEY, total)` operation.

```python
def TotalSupply():
    return TOTAL_AMOUNT * FACTOR
```

```python
def TotalSupply():
    return Get(ctx,SUPPLY_KEY)
```

#### Initialize Token Parameter

In Ontology smart contract, `Notify()` is an interface that used to send notifications (including socket notifications or rpc queries) to clients that are executing this smart contract.

Therefore, if you want to record something public into the Ontology Blockchain, you can use the interface `Notify()`.

```python
def Init():
    if Get(ctx, SUPPLY_KEY):
        Notify('Already initialized!')
        return False
    else:
        total = TOTAL_AMOUNT * FACTOR
        Put(ctx, SUPPLY_KEY, total)
        Put(ctx, concat(TRANSFER_PREFIX, OWNER), total)
        Notify(['transfer', '', OWNER, total])
        return True
```

**NOTE**: By the help of `Put(ctx, concat(TRANSFER_PREFIX, OWNER), total)`, we allot all token to onwer.

### Check Balance

We can maintain an account book in smart contract's storage context, by using `Put()`, `Get()` and allot an unique `key` for earch account.

```python
def BalanceOf(account):
    return Get(ctx, concat(TRANSFER_PREFIX, account))
```

### Support Transfer

#### Transfer

`CheckWitness` interface is used to verify operational permissions of account or contract. We don't want our tokens to be spent by others, so we need to verify operational permissions.

```python
def Transfer(from_acct, to_acct, amount):
    if from_acct == to_acct:
        return True
    if amount == 0:
        return True
    if amount < 0:
        return False
    if CheckWitness(from_acct) == False:
        return False
    if len(to_acct) != 20:
        return False
    fromKey = concat(TRANSFER_PREFIX, from_acct)
    fromBalance = Get(ctx, fromKey)
    if fromBalance < amount:
        return False
    if fromBalance == amount:
        Delete(ctx, fromKey)
    else:
        Put(ctx, fromKey, fromBalance - amount)

    tokey = concat(TRANSFER_PREFIX, to_acct)
    toBalance = Get(ctx, tokey)

    Put(ctx, tokey, toBalance + amount)
    Notify(['transfer', from_acct, to_acct, amount])
    return True
```

#### TransferMulti

```python
def TransferMulti(args):
    for p in (args):
        if len(p) != 3:
            return False
        if Transfer(p[0], p[1], p[2]) == False:
            raise Exception("TransferMulti failed!")
    return True
```

#### TransferFrom

```python
def TransferFrom(sender, from_acct, to_acct, amount):
    if amount < 0:
        return False
    if CheckWitness(sender) == False:
        return False
    if len(to_acct) != 20:
        return False
    appoveKey = concat(concat(APPROVE_PREFIX, from_acct), sender)
    approvedAmount = Get(ctx, appoveKey)
    if approvedAmount < amount:
        return False
    if approvedAmount == amount:
        Delete(ctx, appoveKey)
    else:
        Put(ctx, appoveKey, approvedAmount - amount)

    fromKey = concat(TRANSFER_PREFIX, from_acct)
    fromBalance = Get(ctx, fromKey)
    if fromBalance < amount:
        return False
    if fromBalance == amount:
        Delete(ctx, fromKey)
    else:
        Put(ctx, fromKey, fromBalance - amount)

    tokey = concat(TRANSFER_PREFIX, to_acct)
    toBalance = Get(ctx, tokey)

    Put(ctx, tokey, toBalance + amount)
    Notify(['transfer', from_acct, to_acct, amount])
    return True
```

### Run your DApp

At this point, you can run the DApp in your browser:

```shell
python tutorial_token.py
```

- If everything goes smoothly, your DApp will run on http://127.0.0.1:5001/. 

- If you want to quit it, you can press CTRL+C or close the terminal.

![Token Dapp](img/DXTokenDapp.png)

### Use your DApp

#### Information Query

1. **Query Token Name**

![Token Name](img/tokenName.png)

2. **Query Token Symbol**

![Token Symbol](img/tokenSymbol.png)

3. **Query Token Decimals**

![Token Decimals](img/tokenDecimals.png)

#### DApp Settings

When you select this tab, you can see the following interface:

![Dapp Settings](img/dappSettings.png)

- **Select Default Network**

![selectNet1](img/selectNet1.png)

![selectNet2](img/selectNet2.png)

If you want to connect to a local node, please make sure you have run it in your computer before you connect, or you will receive the following message.

![selectNet3](img/selectNet3.png)

For more details, you can visit [Ontology](https://github.com/ontio/ontology). 

- **Select Default Account**

![electDefaultAccount1](img/selectDefaultAccount1.png)

![selectDefaultAccount2](img/selectDefaultAccount2.png)

- **Create Account**

![createAccount1](img/createAccount1.png)

![createAccount2](img/createAccount2.png)

![createAccount3](img/createAccount3.png)

![createAccount4](img/createAccount4.png)

- **Import Account**

You should paste a private key string into the input box.

![importAccount1](img/importAccount1.png)

You can set a label for you account.

![importAccount2](img/importAccount2.png)

You should input a password for your account.

![importAccount3](img/importAccount3.png)

If you import succeed, you can see your new account in Select's drop-down menu.

![importAccount4](img/importAccount4.png)

You can get your new account's base58 encode address in here:

![importAccount5](img/importAccount5.png)

**NOTE**: The length of your hexadecimal private key should be 64. if you input an error private key, you will get a notify.

![invalidPrivateKe](img/invalidPrivateKey.png)

- **Remove Account**

![removeAccount1](img/removeAccount1.png)

![removeAccount2](img/removeAccount2.png)

![removeAccount3](img/removeAccount3.png)