# ontology-tutorialtoken

## Unboxing the Dapp

- Install Ontology Dapp Box.

```shell
pip install OBox
```

- Install ontology-python-sdk

```shell
pip install ontology-python-sdk
```

- Download the box. This also takes care of installing the necessary dependencies.

```shell
OBox --install tutorialtoken
```

## Creating Smart Contract

With our front-end taken care of, we can focus on the `oep4_token` contract.

- In the `contracts/` directory of your `OBox`, create the file `oep4_token.py` and add the following contents:

```python
from boa.interop.System.Storage import GetContext, Get, Put, Delete
from boa.interop.System.Runtime import Notify, CheckWitness
from boa.builtins import concat, ToScriptHash

ctx = GetContext()
```

- To set our own parameters for the token, we'll be declaring our own name, symbol, and other details. Add the following content block to the contract (between the curly braces):

```python
NAME = 'DXToken'
SYMBOL = 'DX'
DECIMAL = 2
FACTOR = 100000000
OWNER = ToScriptHash("AUQ2cqRs2daQBqTFs6Zun8eYXRe4a9JZUC")
TOTAL_AMOUNT = 1000000000
```

Things to notice:

- The `NAME` and `SYMBOL` variables give our token a unique identity.
- The `DECIMAL` variable determines the degree to which this token can be subdivided. For our example we went with 2 decimal places, similar to dollars and cents.
- The `TOTAL_AMOUNT` variable determines the number of tokens created when this contract is deployed. In this case, the number is arbitrary.

- Implement OEP4 interface

According to[ OEP-Token-Standard](https://github.com/ontio/OEPs/blob/1d9234f2f09fbc0ef9bcf29b6cfca164ff356c52/OEP-4/) We need to add 10 interface for our Token.
